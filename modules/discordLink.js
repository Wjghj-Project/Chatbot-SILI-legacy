const axios = require('axios').default
const qqNumber = require('../secret/qqNumber')
const parseDiscordEmoji = require('../utils/parseDiscordEmoji')
const parseDiscordImages = require('../utils/parseDiscordImages')
const resolveBrackets = require('../utils/resolveBrackets')
const md5 = require('../utils/md5')
const sysLog = require('../utils/sysLog')
const { koishi, discord } = require('../index')

module.exports = () => {
  // QQ 收到消息
  koishi.on('message', session => {
    // koishi.database.getGroup(session.groupId, ['discordWebhook'])
    if (session.groupId === qqNumber.group.fandom) {
      qqToDiscord({ session, discord })
      // console.log('message', session)
    }
  })
  // Discord 收到消息
  discord.on('message', msg => {
    if (
      msg.channel.id === '736880471891378246' && // #QQ互联
      msg.author.id !== '714134302673207426' && // 自己
      msg.author.id !== '736880520297971714' // QQ推送Hook
    ) {
      discordToQQ({ koishi, msg })
    }
  })
  koishi.group(qqNumber.group.fandom).on('send', session => {
    if (/^\[discord\]/i.test(session.content)) return
    qqToDiscord({ session, discord })
    // console.log('send', session)
  })
}

function discordToQQ({ koishi, msg }) {
  const bot = require('../utils/bot')(koishi)
  var content = msg.content
  content = parseDiscordEmoji(content)
  content = parseDiscordImages({ msg, content })
  var send = [
    '[Discord] ' + msg.author.username + '#' + msg.author.discriminator,
    content,
  ].join('\n')
  if (
    msg.channel.id === '736880471891378246' && // #QQ互联
    msg.author.id !== '714134302673207426' && // 自己
    msg.author.id !== '736880520297971714' // QQ推送Hook
  ) {
    sysLog(
      '⇿',
      'Discord信息已推送到QQ',
      msg.author.username + '#' + msg.author.discriminator,
      msg.content
    )
    bot.sendMessage(qqNumber.group.fandom, send)
  }
}

async function qqToDiscord({ session }) {
  let message = session.message || session.content
  message = resolveBrackets(message)
  var send = ''
  if (/\[cq:image,.+\]/gi.test(message)) {
    var image = message.replace(
      /(.*?)\[cq:image.+,url=(.+?)\](.*?)/gi,
      '$1 $2 $3'
    )
    send += image
  } else {
    send += message
  }
  send = send.replace(/\[cq:at,qq=(.+?)\]/gi, '`@$1`')

  if (/\[cq:reply,id=.+\]/i.test(message)) {
    var replyMsg = '',
      replyMsgId = message.match(/\[cq:reply,id=(.+?)\]/i)[1] || 0

    let replyMeta = await session.bot.getMessage(session.channelId, replyMsgId)

    // {
    //   messageId: '-2059103050',
    //   timestamp: 1614868765000,
    //   content: '挂的真快啊',
    //   author: {
    //     userId: '123456',
    //     username: '机智的小鱼君⚡️',
    //     nickname: undefined,
    //     anonymous: undefined
    //   }
    // }
    var replyTime = new Date(replyMeta.timestamp),
      replyDate = `${replyTime.getHours()}:${replyTime.getMinutes()}`

    replyMsg = replyMeta.content
    replyMsg = resolveBrackets(replyMsg)
    replyMsg = replyMsg.split('\n').join('\n> ')
    replyMsg = '> ' + replyMsg + '\n'
    replyMsg =
      `> **__回复 ${replyMeta.author.nickname ||
        replyMeta.author.username} 在 ${replyDate} 的消息__**\n` + replyMsg
    send = send.replace(/\[cq:reply,id=.+?\]/i, replyMsg)
  }

  // console.log('isReply', send)

  let nickname = ''
  let id = session.author.userId
  nickname +=
    session?.sender?.card ||
    session?.sender?.nickname ||
    session?.author?.username ||
    '[UNKNOWN_USER_NAME]'
  nickname += ' (' + id + ')'
  var body = {
    username: nickname,
    content: send,
    avatar_url: 'http://q1.qlogo.cn/g?b=qq&nk=' + id + '&s=640',
  }
  axios
    .post(require('../secret/discord').fandom_zh.webhook, body)
    .then(res => {
      console.log(res.data)
      sysLog('⇿', 'QQ消息已推送到Discord')
    })
    .catch(err => {
      console.error(err)
    })
}

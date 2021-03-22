const axios = require('axios').default
const qqNumber = require('../secret/qqNumber')
const parseDiscordEmoji = require('../utils/parseDiscordEmoji')
const parseDiscordImages = require('../utils/parseDiscordImages')
const resolveBrackets = require('../utils/resolveBrackets')
const sysLog = require('../utils/sysLog')
const { koishi } = require('../index')

module.exports = () => {
  // QQ 收到消息
  koishi
    .platform('onebot')
    .group(qqNumber.group.fandom)
    .on('message', session => {
      qqToDiscord(session)
    })

  // QQ 自己发消息
  koishi
    .platform('onebot')
    .group(qqNumber.group.fandom)
    .on('send', session => {
      if (/^\[discord\]/i.test(session.content)) return
      qqToDiscord(session)
    })

  // Discord 收到消息
  koishi
    .platform('discord')
    .group('566623674770260004')
    .channel('736880471891378246')
    .on('message', session => {
      if (
        session.author.userId !== '736880520297971714' // QQ推送Hook
      ) {
        discordToQQ(session)
      }
    })

  // Discord 自己发消息
  koishi
    .platform('discord')
    .channel('736880471891378246')
    .on('send', session => {
      discordToQQ(session)
    })
}

function discordToQQ(session) {
  if (/(%disabled%|__noqq__)/i.test(session.content)) return

  const bots = require('../utils/bots')
  const bot = bots.onebot()
  let content = session.content
  const sender = `${session.author.nickname ||
    session.author.username}#${session.author.discriminator || '0000'}`
  content = parseDiscordImages({ session, content })
  content = parseDiscordEmoji(content)
  let send = [`[Discord] ${sender}`, content].join('\n')
  sysLog('⇿', 'Discord信息已推送到QQ', sender, session.content)
  bot.sendMessage(qqNumber.group.fandom, send)
}

async function qqToDiscord(session) {
  let message = session.message || session.content
  message = resolveBrackets(message)
  let send = ''
  if (/\[cq:image,.+\]/gi.test(message)) {
    let image = message.replace(
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

    let replyTime = new Date(replyMeta.timestamp),
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

  // 安全性问题
  send = send.replace(/@everyone/g, '@ everyone').replace(/@here/g, '@ here')

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
    .then(() => {
      // console.log(res.data)
      sysLog('⇿', 'QQ消息已推送到Discord')
    })
    .catch(err => {
      koishi.logger('bridge').error(err)
    })
}

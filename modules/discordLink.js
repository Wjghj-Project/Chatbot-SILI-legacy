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
    console.log('isReply', replyMsg)
    var msgData = await axios.get('http://localhost:5700/get_msg', {
      params: {
        message_id: replyMsgId,
      },
    })
    msgData = msgData.data
    // {
    //   "data": {
    //     "group": true,
    //     "message": "第一行\r\n第二行",
    //     "message_id": 633423692,
    //     "real_id": 45531,
    //     "sender": {
    //       "nickname": "机智的小鱼君⚡️",
    //       "user_id": 824399619
    //     },
    //     "time": 1604663086
    //   },
    //   "retcode": 0,
    //   "status": "ok"
    // }
    if (msgData.status === 'ok') {
      var replyTime = new Date(msgData.data.time * 1000),
        replyDate = `${replyTime.getHours()}:${replyTime.getMinutes()}:${replyTime.getSeconds()}`

      replyMsg = msgData.data.message
      replyMsg = resolveBrackets(replyMsg)
      replyMsg = replyMsg.split('\n').join('\n> ')
      replyMsg = '> ' + replyMsg + '\n'
      replyMsg =
        `> **__回复 ${msgData.data.sender.nickname} 在 ${replyDate} 的消息__**\n` +
        replyMsg
      send = send.replace(/\[cq:reply,id=.+?\]/i, replyMsg)
    }
  }

  // console.log('send to discord', send)

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
    avatar_url: 'https://www.gravatar.com/avatar/' + md5(id + '@qq.com'),
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

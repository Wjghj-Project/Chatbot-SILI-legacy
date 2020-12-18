const axios = require('axios').default
const qqNumber = require('../secret/qqNumber')
const parseDiscordEmoji = require('../utils/parseDiscordEmoji')
const parseDiscordImages = require('../utils/parseDiscordImages')
const resolveBrackets = require('../utils/resolveBrackets')
const md5 = require('../utils/md5')
const sysLog = require('../utils/sysLog')

module.exports = ({ koishi, discord }) => {
  // QQ 收到消息
  koishi.receiver.on('message/normal', meta => {
    // koishi.database.getGroup(meta.groupId, ['discordWebhook'])
    if (meta.groupId === qqNumber.group.fandom) {
      qqToDiscord({ meta, discord })
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
}

function discordToQQ({ koishi, msg }) {
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
    koishi.sender.sendGroupMsg(qqNumber.group.fandom, send)
  }
}

async function qqToDiscord({ meta }) {
  meta.message = resolveBrackets(meta.message)
  var send = ''
  if (/\[cq:image,.+\]/gi.test(meta.message)) {
    var image = meta.message.replace(
      /(.*?)\[cq:image.+,url=(.+?)\](.*?)/gi,
      '$1 $2 $3'
    )
    send += image
  } else {
    send += meta.message
  }
  send = send.replace(/\[cq:at,qq=(.+?)\]/gi, '`@$1`')

  if (/\[cq:reply,id=.+\]/i.test(meta.message)) {
    var replyMsg = '',
      replyMsgId = meta.message.match(/\[cq:reply,id=(.+?)\]/i)[1] || 0
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

  var nickname = ''
  nickname += meta.sender.card || meta.sender.nickname
  nickname += ' (' + meta.sender.userId + ')'
  var body = {
    username: nickname,
    content: send,
    avatar_url:
      'https://www.gravatar.com/avatar/' + md5(meta.sender.userId + '@qq.com'),
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

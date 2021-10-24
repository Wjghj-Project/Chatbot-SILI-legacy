require('../utils/sysLog')
const fs = require('fs')
const path = require('path')
const { koishi } = require('../index')

module.exports = () => {
  /**
   * @methid 任意消息事件监听
   */
  // 收到消息
  koishi.on('send', (session) => {
    // 保留记录
    const now = new Date()
    const file = path.resolve(
      __dirname,
      '../../log',
      'send ' + now.format('yyyy-MM-dd') + '.log'
    )
    const text = `[${now.format('yyyy-MM-dd hh:mm:ss')}]
${session.author.username}(${session.selfId}) 发送到 ${session.platform}:${
      session.channelId
    }(${session.subtype})
${session.content}`
    console.log(text)
    fs.writeFile(file, text + '\n', { flag: 'a' }, function() {})
  })
}

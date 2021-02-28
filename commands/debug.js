const axios = require('axios').default
const path = require('path')
const { segment } = require('koishi')

module.exports = ({ koishi }) => {
  /**
   * @module command-debug
   */
  koishi
    .command('debug', '运行诊断测试')
    .option('face', '[id] 发送QQ表情')
    .option('localimg', '本地图片')
    .option('reply', '[content] 回复消息')
    .option('tts', '[text] 基于文字发送tts语音消息')
    .option('urlimg', '<url> 网络图片')
    .option('version', '-v 显示SILI的版本信息', { type: 'boolean' })
    .action(async ({ session, options }) => {
      console.log('!debug', options)

      // face
      if (options.face || options.face === 0) {
        var faceId
        if (
          options.face === true ||
          isNaN(Number(options.face)) ||
          options.face < 0
        ) {
          faceId = 0
        } else {
          faceId = options.face
        }
        // console.log(faceId)
        session.send(`[CQ:face,id=${faceId}]`)
      }

      if (options.localimg) {
        session.send(
          `[CQ:image,file=file:///${path.resolve('./images/test.png')}]`
        )
      }

      if (options.tts) {
        session.send(`[CQ:tts,text=${options.tts || '这是一条测试消息'}]`)
      }

      if (options.urlimg) {
        session.send('wait...')
        session.send('[CQ:image,file=' + options.urlimg + ']')
      }

      if (options.reply) {
        session.send(
          `${segment('quote', { id: session.messageId })} ${
            options.reply === true ? 'hello, world' : options.reply
          }`
        )
      }

      if (options.version) {
        const { data: onebotInfo } = await axios.get(
          'http://127.0.0.1:5700/get_version_info'
        )
        const packageInfo = require('../package.json')
        const versionMsg = [
          `- SILI  : ${packageInfo.version}`,
          `- Koishi: ${packageInfo.dependencies.koishi}`,
          `- OneBot: ${onebotInfo.data.version}`,
        ].join('\n')
        session.send(versionMsg)
      }
    })
}

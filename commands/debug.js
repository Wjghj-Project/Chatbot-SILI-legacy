const axios = require('axios').default
const path = require('path')

module.exports = ({ koishi }) => {
  /**
   * @module command-debug
   */
  koishi
    .command('debug', '运行诊断测试')
    .option('--face [id]', '发送QQ表情')
    .option('--localimg', '本地图片')
    .option('--reply [content]', '回复消息')
    .option('--urlimg <url>', '网络图片')
    .option('--version, -v', '显示SILI的版本信息', { type: 'boolean' })
    .action(async ({ meta, options }) => {
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
        meta.$send(`[CQ:face,id=${faceId}]`)
      }

      if (options.localimg) {
        meta.$send(
          `[CQ:image,file=file:///${path.resolve('./images/test.png')}]`
        )
      }

      if (options.urlimg) {
        meta.$send('wait...')
        meta.$send('[CQ:image,file=' + options.urlimg + ']')
      }

      if (options.reply) {
        meta.$send(
          `[CQ:reply,id=${meta.messageId}] ${
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
        meta.$send(`[CQ:reply,id=${meta.messageId}]${versionMsg}`)
      }
    })
}

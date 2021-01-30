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
    .option('--discord-emoji <id>', 'Discord 表情包', { isString: true })
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
            options.reply === true ? 'Hello, world' : options.reply
          }`
        )
      }

      if (options.discordEmoji) {
        meta.$send(
          '[CQ:image,file=https://discord-emoji.vercel.app/api/emojis/' +
            options.discordEmoji +
            ']'
        )
      }
    })
}

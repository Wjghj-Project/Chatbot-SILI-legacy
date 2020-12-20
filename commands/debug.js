module.exports = ({ koishi }) => {
  /**
   * @module command-debug
   */
  koishi
    .command('debug', '运行诊断测试')
    .option('--face [id]', '发送QQ表情')
    .option('--localimg')
    .option('--urlimg <url>')
    .option('--discord-emoji <id>', { isString: true })
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
        meta.$send('[CQ:image,file=file:////opt/gobot/test.png]')
      }

      if (options.urlimg) {
        meta.$send('wait...')
        meta.$send('[CQ:image,file=' + options.urlimg + ']')
      }

      if (options.discordEmoji) {
        // https://discord-emoji.vercel.app/api/get/?id=
        // https://pd.zwc365.com/cfworker/https://cdn.discordapp.com/emojis/
        meta.$send(
          '[CQ:image,file=https://discord-emoji.vercel.app/api/emojis/' +
            options.discordEmoji +
            ']'
        )
      }
    })
}

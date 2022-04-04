const { koishi } = require('../')

module.exports = () => {
  koishi
    .platform('discord')
    .on('before-command', ({ session }) => (isDiscordBot(session) ? '' : void 0))
  koishi
    .platform('discord')
    .on('dialogue/before-send', ({ session }) =>
      isDiscordBot(session) ? true : void 0
    )
  // @FIX 空白信息会随机触发任意上下文的问答
  koishi.on('dialogue/before-send', ({ session }) =>
    !session.content?.trim() ? true : void 0
  )

  function isDiscordBot(session) {
    return !!(
      session.author.isBot ||
      !session.author.discriminator ||
      session.author.discriminator === '0000'
    )
  }
}

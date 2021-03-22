// const { segment } = require('koishi-utils')
const { koishi } = require('../')

module.exports = () => {
  koishi
    .platform('discord')
    .group('566623674770260004', '614402285895811082')
    .on('before-command', ({ session }) => {
      if (/^!/.test(session.content)) {
        koishi.logger('MAIN').info('为避免前缀重合，已终止响应该指令')
        return ''
      }
    })

  koishi.platform('discord').on('before-command', ({ session }) => {
    console.log(session.author)
    if (
      !session.author.discriminator ||
      session.author.discriminator === '0000'
    ) {
      koishi.logger('MAIN').info('不响应非人类调用的指令')
      return ''
    }
  })
}

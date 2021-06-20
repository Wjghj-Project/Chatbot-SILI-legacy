// const { segment } = require('koishi-utils')
const { Session } = require('koishi-core')
const { koishi } = require('../')

module.exports = () => {
  koishi
    .platform('discord')
    .on('before-command', ({ session }) => killCmd(session, ''))
  koishi
    .platform('discord')
    .on('dialogue/before-send', ({ session }) => killCmd(session, true))

  /**
   * @param {Session} session
   * @param {*} rep
   */
  function killCmd(session, rep) {
    if (
      session.author.isBot ||
      !session.author.discriminator ||
      session.author.discriminator === '0000'
    ) {
      koishi.logger('MAIN').info('不响应非人类调用的指令')
      return rep
    }
  }
}

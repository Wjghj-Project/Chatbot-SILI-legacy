const { koishi } = require('../')

module.exports = {
  onebot() {
    const bot =
      // koishi.bots['onebot:' + require('../secret/qqNumber').user.mySelf]
      koishi.bots[0]
    bot.sendGroupMsg = bot.sendMessage
    bot.sendMsg = bot.sendMessage
    return bot
  },
  discord() {
    const bot = koishi.bots[1]
    return bot
  },
}

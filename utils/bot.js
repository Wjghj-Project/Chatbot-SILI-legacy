module.exports = koishi => {
  const bot = koishi.bots['onebot:' + require('../secret/qqNumber').user.mySelf]
  bot.sendGroupMsg = bot.sendMessage
  bot.sendMsg = bot.sendMessage
  return bot
}

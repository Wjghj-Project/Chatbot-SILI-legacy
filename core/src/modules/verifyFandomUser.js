const fandomQQ = require('../secret/qqNumber').group.fandom
const verifyQQ = require('../utils/verifyQQ')
const { koishi } = require('../index')

/**
 * @module verifyFandomUser FandomQQ群验证QQ号
 */
module.exports = () => {
  koishi
    .channel(fandomQQ)
    .command('verify-qq 验证保存在Fandom社区中心的QQ号信息')
    .option('user', '-u <user> 指定Fandom用户名')
    .option('qq', '-q [qq] 指定QQ号，预设为调用者的QQ')
    .action(async ({ session, options }) => {
      try {
        const { msg } = await verifyQQ(session, options)
        return msg
      } catch (err) {
        koishi.logger('verify-qq').warn(err)
        return `查询时遇到错误：${err.message}`
      }
    })
}

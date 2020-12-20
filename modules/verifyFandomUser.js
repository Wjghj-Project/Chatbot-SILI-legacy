const fandomQQ = require('../secret/qqNumber').group.fandom
const verifyQQ = require('../utils/verifyQQ')

/**
 * @module verifyFandomUser FandomQQ群验证QQ号
 */
module.exports = ({ koishi }) => {
  koishi
    .group(fandomQQ)
    .command('verify-qq', '验证保存在Fandom社区中心的QQ号信息')
    .option('--user <user>', '指定Fandom用户名')
    .option('--qq [qq]', '指定QQ号，预设为调用者的QQ')
    .action(({ meta, options }) => {
      verifyQQ(meta, options, ({ status, msg }) => {
        meta.$send(msg)
      })
    })
}

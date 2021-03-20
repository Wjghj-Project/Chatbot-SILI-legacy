const sysLog = require('../utils/sysLog')
const { koishi } = require('../index')

module.exports = () => {
  koishi.on('friend-request', session => {
    sysLog('💌', '收到好友申请', session)
  })
}

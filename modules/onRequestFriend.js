const sysLog = require('../utils/sysLog')
const { koishi } = require('../index')

module.exports = () => {
  koishi.on('friend-request', session => {
    var answer = session.comment.replace(/.*\n回答:(.+)\n.*/i, '$1')
    var user = session.userId
    var approve = false
    // if (/(机智的小鱼君|dragon fish|xiaoyujun)/gi.test(session.comment)) {
    //   // session.$approve()
    //   // approve = true
    //   session.$reject('主人告诉我不能随便添加陌生人好友，抱歉啦~')
    // } else {
    //   session.$reject('不对不对，不要随便回答啊！')
    // }
    sysLog(
      '💌',
      '收到好友申请',
      '用户' + user,
      '回答:' + answer,
      approve ? '√通过' : '×拒绝'
    )
  })
}

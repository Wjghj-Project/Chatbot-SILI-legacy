const sysLog = require('../utils/sysLog')

module.exports = ({ koishi }) => {
  /**
   * @methid 任意消息事件监听
   */
  // 收到消息
  koishi.receiver.on('message', meta => {
    // 保留记录
    switch (meta.messageType) {
      case 'private':
        sysLog('✉', '收到私信', meta.userId, meta.message)
        break
      case 'group':
        sysLog(
          '✉',
          '收到群消息',
          '群' + meta.groupId,
          '用户' + meta.sender.userId,
          meta.message
        )
        break
      default:
        sysLog(
          '✉',
          '收到其他消息',
          '类型' + meta.messageType,
          '用户' + meta.sender.userId,
          meta.message
        )
        break
    }
    // 判断用户是否存在
    if (meta.sender.userId) {
      koishi.database.getUser(meta.sender.userId).then(res => {
        // console.log('用户信息', res)
        if (res.authority < 1) {
          // 初始化用户数据
          koishi.database.mysql
            .query(
              "INSERT INTO `user` (`id`, `flag`, `authority`, `usage`) VALUES ('" +
                meta.sender.userId +
                "', '0', '1', '{}');"
            )
            .then(create => {
              console.log('新建用户数据', create)
            })
        }
      })
    }
    // 判断群是否存在
    // if (meta.groupId) {
    //   koishi.database.getGroup(meta.groupId).then(res => {
    //     // 初始化群数据
    //     if (res.flag === 3) {
    //       koishi.database.mysql.query(
    //         "INSERT INTO `group` (`id`, `flag`, `assignee`) VALUES ('" +
    //           meta.groupId +
    //           "', '0', '0');"
    //       )
    //     }
    //   })
    // }
  })
}

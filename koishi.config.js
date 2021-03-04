// 这些文件不会被push，保存着各种不可告人的秘密
const qqNumber = require('./secret/qqNumber') // 机器人的QQ

module.exports = {
  type: 'onebot:ws',
  port: 3100,
  server: 'ws://127.0.0.1:5700',
  selfId: qqNumber.user.mySelf,
  nickname: 'sili',
  prefix: ['!', '！'],
  // database: {
  //   mysql: {
  //     host: '127.0.0.1',
  //     port: 3306,
  //     user: 'root',
  //     password: password.dbPassword.mysql.root,
  //     database: 'qqbot-sili',
  //   },
  // },
  // 当数据库中不存在用户，以 1 级权限填充
  autoAuthorize: 1,
  // 自动配置群组
  autoAssign: true,
}

// 这些文件不会被push，保存着各种不可告人的秘密
const qqNumber = require('./secret/qqNumber') // 机器人的QQ
const password = require('./secret/password') // password
// require('koishi-database-mysql')

module.exports = {
  type: 'http',
  port: 3100,
  server: "http://localhost:5700",
  selfId: qqNumber.user.sili,
  nickname: "sili",
  commandPrefix: ['!', '！'],
  database: {
    mysql: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: password.dbPassword.mysql.root,
      database: 'qqbot-sili'
    }
  },
  // 当数据库中不存在用户，以 1 级权限填充
  defaultAuthority: 1
}
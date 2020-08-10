// 这些文件不会被push，保存着各种不可告人的秘密
const botId = require('./models/secret_qqNumber') // 机器人的QQ
const password = require('./models/secret_password') // password
// require('koishi-database-mysql')

module.exports = {
  type: 'http',
  port: 3100,
  server: "http://localhost:5700",
  selfId: botId.user.sili,
  nickname: "sili",
  commandPrefix: ['!', '！'],
  database: {
    mysql: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: password.dbPassword.mysql.root,
      database: 'wjghj-qqbot-koishi'
    }
  },
  // 当数据库中不存在用户，以 1 级权限填充
  defaultAuthority: 1
}
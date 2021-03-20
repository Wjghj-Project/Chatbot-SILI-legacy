// 这些文件不会被push，保存着各种不可告人的秘密
const qqNumber = require('./secret/qqNumber') // 机器人的QQ
const discordToken = require('./secret/discord').botToken

module.exports = {
  port: 3100,
  // 定义机器人账号
  bots: [
    // QQ
    {
      type: 'onebot:ws',
      server: 'ws://127.0.0.1:5700',
      selfId: qqNumber.user.mySelf,
    },
    // Discord
    {
      type: 'discord',
      token: discordToken.SILI,
    },
  ],
  // 昵称
  nickname: 'sili',
  // 指令前缀
  prefix: ['!', '！'],
  // 当数据库中不存在用户，以 1 级权限填充
  autoAuthorize: 1,
  // 自动配置群组
  autoAssign: true,
}

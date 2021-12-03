const https = require('https')
const agent = new https.Agent({
  rejectUnauthorized: false,
})

/** @type {import('koishi').App.Config} */
module.exports = {
  port: 3100,
  selfUrl: 'https://sili.wjghj.cn',
  // 昵称
  nickname: 'sili',
  // 指令前缀
  prefix(session) {
    if (session.channelId === '566623674770260004') {
      return ['.', '。']
    }
    return ['!', '！']
  },
  // 当数据库中不存在用户，以 1 级权限填充
  autoAuthorize: 1,
  // 自动配置群组
  autoAssign: true,
  // 延迟
  delay: {
    message: 1000,
    prompt: 30 * 1000,
  },
  axiosConfig: {
    httpsAgent: agent,
    Headers: {
      // 'User-Agent': password.userAgent
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
    },
  },
}

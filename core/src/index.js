/**
 * @name Chatbot-SILI 万界规划局QQ机器人
 * @author 机智的小鱼君 dragon-fish[at]qq.com
 *
 * @description Wjghj Project QQ机器人
 *
 * @license MIT
 */

/**
 * @dependencies 导入依赖
 */
const { App } = require('koishi') // koishi 机器人库
const koishiConfig = require('./koishi.config')
// const password = require('./secret/password')
// const sysLog = require('./utils/sysLog') // sysLog 保存日志
const qqNumber = require('./secret/qqNumber')

/**
 * @instance App koishi实例
 */
// App
const koishi = new App(koishiConfig)
// Adapters
koishi.plugin(require('@koishijs/plugin-adapter-onebot').default, {
  protocol: 'ws',
  selfId: qqNumber.user.mySelf,
  endpoint: 'ws://127.0.0.1:5700',
})
// koishi.plugin(require('@koishijs/plugin-adapter-discord').default, {
//   secret: password.discordToken.mySelf,
// })
// Database
koishi.plugin(require('@koishijs/plugin-database-mongo').default, {
  host: '127.0.0.1',
  port: 27017,
  database: 'koishi_v4',
})

// Hack QQ channel
// koishi.plugin(require('./plugins/qq-channel-patch'), {})

// Autoloads
require('./commands/_index')
require('./modules/_index')

koishi.start().then(() => {
  koishi.logger('APP').success('🌈', 'Koishi 启动成功')
})

module.exports = {
  name: 'index',
  // 导出 App 实例
  App: koishi,
  ctx: koishi,
  koishi,
}

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
const password = require('./secret/password')
const sysLog = require('./utils/sysLog') // sysLog 保存日志

/**
 * @instance App koishi实例
 */
// Adapter
require('koishi-adapter-discord')
require('koishi-adapter-onebot')
// App
const koishi = new App(koishiConfig)
// Database
koishi.plugin(require('koishi-plugin-mongo'), {
  host: '127.0.0.1',
  port: 27017,
  name: 'koishi',
  username: 'koishi',
  password: password.dbPassword.mongo.koishi,
})

/**
 * @module autoLoads
 */
require('./commands/_index')
require('./modules/_index')

/**
 * @method koishi.start koishi启动完毕，登录discord
 */
koishi.start().then(() => {
  sysLog('🌈', 'Koishi 启动成功')
})

module.exports = {
  name: 'index',
  // 导出 App 实例
  App: koishi,
  ctx: koishi,
  koishi,
}

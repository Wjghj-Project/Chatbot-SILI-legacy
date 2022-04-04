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

// Hack QQ channel
koishi.plugin(require('./plugins/qq-channel-patch'), {})

// @TODO white list
// const block = (session) => {
//   const whiteList = [
//     // 沙盒
//     '1029954579',
//     // Fandom
//     '254794102',
//     '736880471891378246',
//     // 萌娘百科代码部
//     '620653589',
//     '155169589',
//     // 萌娘百科限水编辑群
//     '1001730756',
//     // ngnl 闲聊
//     '759937396',
//     // IPE
//     '1026023666',
//   ]
//   if (session.channelId && !whiteList.includes(session.channelId)) {
//     // koishi.logger('BLOCK').info('已阻断非白名单群发消息', session.channelId)
//     return true
//   }
// }
// koishi.middleware(block)
// koishi.on('message', block)
// koishi.before('send', block)

/**
 * @module autoLoads
 */
require('./commands/_index')
require('./modules/_index')

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

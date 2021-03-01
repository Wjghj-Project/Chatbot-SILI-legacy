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
const discordJS = require('discord.js')
const discord = new discordJS.Client()

/**
 * @instance app koishi实例
 */
require('koishi-adapter-onebot') // adapter
const koishi = new App(koishiConfig)

koishi.plugin(require('koishi-plugin-mongo'), {
  host: '127.0.0.1',
  port: 27017,
  username: 'koishi',
  password: password.dbPassword.mongo.koishi,
  name: 'koishi',
})

/**
 * @module autoLoads
 */
require('./commands/_index')({ discord, koishi })
require('./modules/_index')({ discord, koishi })

/**
 * @method discordLogin
 */
discord.login(require('./secret/discord').botToken.XiaoYuJunBot)
discord.on('ready', () => {
  sysLog('🌈', `Discord 成功登录 ${discord.user.tag}`)
})

/**
 * @method koishi.start koishi启动完毕，登录discord
 */
koishi.start().then(() => {
  sysLog('🌈', 'QQ 成功登录')
})

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
const sysLog = require('./utils/sysLog') // sysLog 保存日志
const password = require('./secret/password')

const discordJS = require('discord.js')
const discord = new discordJS.Client()

/**
 * @instance app koishi实例
 */
require('koishi-adapter-onebot') // adapter
const koishi = new App(koishiConfig)

// plugins
koishi.plugin(require('koishi-plugin-common'))
koishi.plugin(require('koishi-plugin-mysql'), {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: password.dbPassword.mysql.root,
  database: 'chatbot-sili',
})
koishi.plugin(require('koishi-plugin-teach'), {
  prefix: '?!',
})
koishi.plugin(require('koishi-plugin-genshin'), {
  cookie: password.mhyCookie,
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

/**
 * @name wjghj-qqbot-koishi 万界规划局QQ机器人
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
require('koishi-database-mysql') // 数据库驱动
const sysLog = require('./utils/sysLog') // sysLog 保存日志

const discordJS = require('discord.js')
const discord = new discordJS.Client()

/**
 * @instance app koishi实例
 */
const koishi = new App(koishiConfig)

/**
 * @dependencies 添加 koishi 插件
 */
koishi.plugin(require('koishi-plugin-mcping'))
// koishi.plugin(require('koishi-plugin-teach'), {
//   prefix: '%teach',
// })
koishi.plugin(require('koishi-plugin-image-search'))

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

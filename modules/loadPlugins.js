const path = require('path')
const password = require('../secret/password')

/**
 * @module loadPlugins 插件配置
 */
module.exports = ({ koishi }) => {
  koishi.plugin(require('koishi-plugin-common'), {
    // 欢迎信息
    // welcomeMessage({ userId }) {
    //   return '❤群成员增加了，[CQ:at,qq=' + userId + ']欢迎新大佬！'
    // },
    // 复读机
    repeater: {
      // 3次自动复读，并设置30秒cd
      repeat: (repeated, times) => {
        let repeatCD = 30
        globalThis.repeaterLast = globalThis.repeaterLast || 0
        let now = new Date().getTime()
        if (times === 3 && now - globalThis.repeaterLast > repeatCD * 1000) {
          globalThis.repeaterLast = now
          return true
        } else if (times === 3) {
          console.log('距离上次复读不足' + repeatCD + '秒')
        }
      },
      // 复读大于5次打断
      interrupt: (_, times /*, message*/) => times > 5,
      interruptText: `[CQ:image,file=file:///${path.resolve(
        './images/no_repeat.jpg'
      )}]`,
    },
  })
  // koishi.plugin(require('koishi-plugin-mysql'), {
  //   host: '127.0.0.1',
  //   port: 3306,
  //   user: 'root',
  //   password: password.dbPassword.mysql.root,
  //   database: 'chatbot-sili',
  // })
  koishi.plugin(require('koishi-plugin-mongo'), {
    host: '127.0.0.1',
    port: 27017,
    username: 'koishi',
    password: password.dbPassword.mongo.koishi,
    name: 'koishi',
  })
  koishi.plugin(require('koishi-plugin-teach'), {
    prefix: '?!',
  })
  koishi.plugin(require('koishi-plugin-genshin'), {
    cookie: password.mhyCookie,
  })
  koishi.plugin(
    require('koishi-plugin-iqdb', {
      alias: ['搜图'],
      unsafeAuthority: 2,
    })
  )
  koishi.plugin(require('../plugins/dbadmin'))
}

const password = require('../secret/password')
const { koishi } = require('../index')
const { segment } = require('koishi-utils')
const path = require('path')

/**
 * @module loadPlugins 插件配置
 */
module.exports = () => {
  koishi.plugin(require('koishi-plugin-common'), {
    // 复读机
    onRepeat(state, session) {
      let repeatCD = 30
      globalThis.repeaterLast = globalThis.repeaterLast || 0
      let now = new Date().getTime()

      // 参与复读
      if (
        state.times === 3 &&
        now - globalThis.repeaterLast > repeatCD * 1000 &&
        1 - Math.random() > 0.8
      ) {
        globalThis.repeaterLast = now
        return state.content
      }

      // 冷却未好
      else if (state.times === 3) {
        session.logger('复读机').info('距离上次复读不足' + repeatCD + '秒')
      }

      // 大于 5 次，打断复读
      if (state.times > 5) {
        return segment('image', {
          file: `file:///${path.resolve('./images/no_repeat.jpg')}`,
        })
      }
    },
    // repeater: {
    // 3次自动复读，并设置30秒cd
    // repeat: (repeated, times) => {
    //   let repeatCD = 30
    //   globalThis.repeaterLast = globalThis.repeaterLast || 0
    //   let now = new Date().getTime()
    //   if (times === 3 && now - globalThis.repeaterLast > repeatCD * 1000) {
    //     globalThis.repeaterLast = now
    //     return true
    //   } else if (times === 3) {
    //     console.log('距离上次复读不足' + repeatCD + '秒')
    //   }
    // },
    // // 复读大于5次打断
    // interrupt: (_, times /*, message*/) => times > 5,
    // interruptText: `[CQ:image,file=file:///${path.resolve(
    //   './images/no_repeat.jpg'
    // )}]`,
    // },
  })
  koishi.plugin(require('koishi-plugin-teach'), {
    prefix: '?!',
  })
  // koishi.plugin(require('koishi-plugin-schedule'))
  koishi.plugin(require('koishi-plugin-genshin'), {
    cookie: password.mhyCookie,
  })
  koishi.plugin(require('koishi-plugin-tools'))
  koishi.plugin(require('koishi-plugin-image-search'))
  koishi.plugin(require('../plugins/dbadmin'))
  koishi.plugin(require('../plugins/recall'))
  koishi.plugin(require('../plugins/youdao'))
  // koishi.plugin(require('koishi-plugin-status'), {})
  koishi.plugin(require('koishi-plugin-blame'), {
    catch: ['unhandledRejection'],
    send: {
      private: ['onebot:' + require('../secret/qqNumber').user.xiaoyujun],
      group: [],
    },
    sender: ['onebot:' + require('../secret/qqNumber').user.mySelf],
  })
}

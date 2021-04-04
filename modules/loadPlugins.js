const password = require('../secret/password')
const { koishi } = require('../index')
const { segment } = require('koishi-utils')
const path = require('path')

/**
 * @module loadPlugins 插件配置
 */
module.exports = () => {
  koishi.plugin(require('koishi-plugin-blame'), {
    catch: ['unhandledRejection'],
    send: {
      private: ['onebot:' + require('../secret/qqNumber').user.xiaoyujun],
      group: [],
    },
    sender: ['onebot:' + require('../secret/qqNumber').user.mySelf],
  })
  koishi.plugin(require('koishi-plugin-common'), {
    // 复读机
    onRepeat(state) {
      let repeatCD = 45 * 1000
      let stopRepeatCD = 30 * 1000
      globalThis.repeaterLast = globalThis.repeaterLast || 0
      globalThis.stopRepeatLast = globalThis.stopRepeatLast || 0
      let now = new Date().getTime()

      // 参与复读
      if (state.times === 3 && now - globalThis.repeaterLast > repeatCD) {
        // if (1 - Math.random() > 0.8) {
        globalThis.repeaterLast = now
        return state.content
        // } else {
        //   koishi.logger('复读机').info('概率未触发复读机')
        // }
      }

      // 冷却未好
      else if (state.times === 3) {
        koishi.logger('复读机').info('距离上次复读不足' + repeatCD + '秒')
      }

      // 大于 5 次，打断复读
      if (state.times === 5 && now - globalThis.stopRepeatLast > stopRepeatCD) {
        return (
          segment('image', {
            file: `file:///${path.resolve('./images/no_repeat.jpg')}`,
          }) + 'No，不要再复读了！'
        )
      }
    },
  })
  koishi.plugin(require('koishi-plugin-github'), {
    path: '/api/github',
    appId: password.github.appId,
    appSecret: password.github.appSecret,
  })
  koishi.plugin(require('koishi-plugin-genshin'), {
    cookie: password.mhyCookie,
  })
  koishi.plugin(require('koishi-plugin-image-search'))
  koishi.plugin(require('koishi-plugin-rss'))
  koishi.plugin(require('koishi-plugin-schedule'))
  koishi.plugin(require('koishi-plugin-shell'), {
    shell: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
  })
  koishi.plugin(require('koishi-plugin-webui'), {
    title: 'SILI 监控中心',
    uiPath: '/dash',
    apiPath: '/dash/status',
  })
  // koishi.plugin(require('koishi-plugin-chat'))
  koishi.plugin(require('koishi-plugin-teach'), {
    prefix: '?!',
  })
  koishi.plugin(require('koishi-plugin-tools'), {})

  // Local plugins
  koishi.plugin(require('../plugins/dbadmin'))
  koishi.plugin(require('../plugins/youdao'))
  koishi.plugin(require('../plugins/webui-plus'))
}

const password = require('../secret/password')
const { koishi } = require('..')
const { segment } = require('koishi-utils')
const path = require('path')
const { Time } = require('koishi')

/**
 * @module loadPlugins 插件配置
 */
module.exports = () => {
  koishi.plugin(require('koishi-plugin-animal-picture'))
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

      // 复读多达 6 次，打断复读
      if (state.times === 6 && now - globalThis.stopRepeatLast > stopRepeatCD) {
        return (
          segment('image', {
            file: `file:///${path.resolve('./images/no_repeat.jpg')}`,
          }) + 'No，不要再复读了！'
        )
      }
    },
  })
  koishi.command('switch', '', { authority: 2 })
  // .option('target', '', { authority: 3 })
  koishi.command('switch')._options.target.authority = 3
  koishi
    .command('callme', '', { minInterval: Time.hour, maxUsage: 5 })
    .userFields(['name'])
    .check(({ session }, i) => {
      if (!i)
        return session.user.name
          ? `sili认得你，${session.user.name}，你好～`
          : '你还没有给自己取一个名字呢'
    })

  koishi.plugin(require('koishi-plugin-github'), {
    path: '/api/github',
    appId: password.github.appId,
    appSecret: password.github.appSecret,
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
    apiPath: '/api/status',
  })
  koishi.plugin(require('koishi-plugin-chat'))
  koishi.plugin(require('koishi-plugin-teach'), {
    prefix: '?!',
  })
  koishi.plugin(require('koishi-plugin-tools'), {})

  // 原神插件
  koishi.plugin(require('/koishi-plugin-genshin'), {
    // browserPath: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
    browserPath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    cookie: password.mhyCookie,
    // gachaPool: require('../utils/genshinGachaPool'),
    wish: {
      enable: true,
    },
  })
  koishi
    .command('genshin.wish', '', { authority: 2 })
    .shortcut(/^原神(武器|角色|常驻)池?([0-9]+)连抽?$/, {
      options: { type: '$1', number: '$2' },
    })
  koishi.command('genshin.backpack', '', { authority: 2 }).shortcut('原神背包')

  // Local plugins
  koishi.plugin(require('../plugins/dbadmin'))
  koishi.plugin(require('../plugins/youdao'))
  // koishi.plugin(require('../plugins/webui-plus'))
  koishi.plugin(require('/koishi-plugin-mediawiki'), {})
  // koishi.plugin(require('../../koishi-plugin-blive'), {})
  koishi.plugin(require('../plugins/bilibili-plus'), {})
  koishi.plugin(require('/koishi-plugin-welcome'), {})
}

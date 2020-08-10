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
const { App, startAll, createUser, createGroup, UserFlag, GroupFlag } = require('koishi') // koishi 机器人库
require('koishi-database-mysql') // 数据库驱动
const axios = require('axios') // axios 用于发送http请求
const { fandomCommunitySearch } = require('./models/cmd_fandomCommunitySearch') // fandomCommunitySearch
const md5 = require('md5') // md5 生成哈希值
const { random } = require('./models/random') // random 从数组中随机抽取一个
const { sysLog } = require('./models/sysLog') // sysLog 保存日志

// 以下文件不会被推送
const qqNumber = require('./models/secret_qqNumber')

/**
 * @instance app koishi实例
 */
const app = new App(require('./koishi.config'))

/**
 * @dependencies 添加 koishi 插件
 */
app.plugin(require('koishi-plugin-common'))
// app.plugin(require('koishi-plugin-chess'))
app.plugin(require('koishi-plugin-mcping'))
// app.plugin(require('koishi-plugin-mysql'))
app.plugin(require('koishi-plugin-image-search'))
// app.plugin(require('koishi-plugin-status'))

/**
 * @method app.start 启动实例
 */
app.start().then(init)
// startAll()


function init() {
  /**
   * @module util-qq-link
   * @description Fandom QQ群 → Discord
   */
  app.group(254794102).receiver.on('message', meta => {
    meta.message = meta.message.replace(new RegExp('&#91;', 'g'), '[')
    meta.message = meta.message.replace(new RegExp('&#93;', 'g'), ']')
    var send = ''
    if (/\[cq:image,file=.+\]/i.test(meta.message)) {
      var image = meta.message.replace(/(.*?)\[cq:image.+,url=(.+?)\](.*?)/ig, '$1 $2 $3')
      send += image
    } else {
      send += meta.message
    }
    send = send.replace(/\[cq:at,qq=(.+?)\]/ig, '`@$1`')
    var nickname = ''
    nickname += meta.sender.card || meta.sender.nickname
    nickname += ' (' + meta.sender.userId + ')'
    var body = {
      username: nickname,
      content: send,
      avatar_url: 'https://www.gravatar.com/avatar/' + md5(meta.sender.userId + '@qq.com')
    }
    axios.post(require('./models/secret_discord').fandom_zh.webhook, body)
      .then(res => {
        sysLog('⇿', '消息已推送到Discord')
      })
      .catch(err => {
        console.error(err)
      })
  })

  /**
   * @module util-fandom-qq-group
   * @description Fandom QQ Group Extensions
   */
  app.group(254794102, 1029954579).receiver.on('message', meta => {
    // wikiUrl
    meta.message = meta.message.replace(new RegExp('&#91;', 'g'), '[')
    meta.message = meta.message.replace(new RegExp('&#93;', 'g'), ']')
    if (/\[\[.+\]\]/g.test(meta.message)) {
      var pageName = meta.message.replace(/.*\[\[(.+)\]\].*/g, '$1')
      axios.get('https://community.fandom.com/api.php?action=query&format=json&prop=info&inprop=url&iwurl=1&titles=' + encodeURI(pageName)).then(
        res => {
          var link = '没有找到“' + pageName + '”相关的链接~'
          var data = res.data
          var query = data.query
          if (query.hasOwnProperty('pages')) {
            var pages = query.pages
            link = pages[Object.keys(pages)[0]].fullurl || link
          } else if (query.hasOwnProperty('interwiki')) {
            link = query.interwiki[0].url || link
          }
          meta.$send(link)
        },
        err => {
          console.error(err)
        }
      )
    }
    // 关键词触发指令
    if (/(联系官方|zendesk|发工单)/i.test(meta.message)) {
      app.executeCommandLine('contact-fandom', meta)
    }
    if (/(帮助中心)/i.test(meta.message)) {
      app.executeCommandLine('fandom-help-center', meta)
    }
  })

  /**
   * @module cmd-contactFandom
   */
  app.command('contact-fandom', '回应Fandom的zendesk链接的快捷方式')
    .alias('fandom-zendesk')
    .action(({ meta }) => {
      meta.$send([
        '联系Fandom官方，提交申请、反馈问题等，可以前往Zendesk发送工单：',
        'https://fandom.zendesk.com/hc/en-us/requests/new'
      ].join('\n'))
    })

  /**
   * @module cmd-fandomHelpCenter
   */
  app.command('fandom-help-center', '回应Fandom的帮助中心链接的快捷方式')
    .alias('fandom-help')
    .action(({ meta }) => {
      meta.$send([
        '遇到不懂的问题，可以先查看Fandom帮助中心：',
        '• 帮助中心 https://community.fandom.com/zh/index.php?curid=2713',
        '• 编辑入门 https://community.fandom.com/zh/index.php?curid=5075',
        '• Wikitext https://community.fandom.com/zh/index.php?curid=6646',
        '• Wiki设计 https://community.fandom.com/zh/index.php?curid=8373'
      ].join('\n'))
    })

  /**
   * @module cmd-fandomCommunitySearch
   */
  app.command('fandom-community-search <wiki>', '通过名称搜索Fandom Wiki，预设搜索语言为en')
    .alias('搜索fandom', 'fandom-wiki-search', 'search-fandom', 'fandoms', 'fms')
    .option('-l, --lang <lang>', '搜索的语言，例如zh，预设en', { default: 'en' })
    .option('-n, --nth <num>', '展示第几个结果', { default: 1 })
    .shortcut('搜索fandom', { prefix: true, fuzzy: true })
    .action(({ meta, options }, wiki) => {
      var before = new Date().getTime()
      var lang = options.lang || 'en'
      fandomCommunitySearch(wiki, lang, res => {
        var ping = new Date().getTime() - before
        var nth = isNaN(options.nth) ? 1 : options.nth
        if (nth > 10 || nth < 1 || nth > res.wikis.length) nth = 1
        var indexNth = nth - 1
        // console.log(res)
        if (res.status) {
          // 创建空数组
          var text = [
            `通过关键词“${res.searchText}”共找到大约${res.total}个wiki`,
            '* 展示第' + nth + '个结果',
            '',
            res.wikis[indexNth].name,
            '链接: ' + res.wikis[indexNth].url,
            '页面: ' + res.wikis[indexNth].pages,
            '',
            '简介:',
            res.wikis[indexNth].description,
            '',
            `(搜寻耗时: ${ping}ms)`
          ]

          // 合并数组为字符串
          text = text.join('\n')
          // 起飞
          meta.$send(text)
        } else {
          meta.$send('搜索wiki时出现问题')
        }
      })
    })

  /**
   * @module cmd-ping
   */
  app.command('ping', '应答测试')
    .alias('在吗', '测试', '!')
    .action(({ meta }) => {
      var now = new Date().getTime()
      var ping = now - meta.time
      console.log('延迟 ' + ping + 'ms')
      var randomReply = random([
        'pong~',
        '诶，我在~',
        '叫我干嘛呀~',
        'Link start~',
        'Aye Aye Captain~',
        'I\'m still alive~'
      ])
      meta.$send(randomReply + ' (' + ping + 'ms)')
    })

  /**
   * @module cmd-say
   */
  app.command('say <msg...>', '让SILI进行发言')
    .alias('说')
    .action(({ meta }, msg) => {
      if (
        (meta.userId === 824399619 && meta.metaType !== 'private') ||
        meta.messageType === 'private'
      ) {
        meta.$send(msg)
        meta.$delete()
      } else {
        meta.$send('(SILI看了你一眼，但是什么也没做)')
      }
    })

  /**
   * @module cmd-inpageeditSearch
   */
  app.command('inpageedit-search <sitename>', '通过Wiki名称查询InPageEdit的使用情况')
    .alias('ipe-search', 'ipes')
    .action(({ meta }, sitename) => {
      var before = new Date().getTime()
      if (!sitename) sitename = ''
      axios.get('https://api.wjghj.cn/inpageedit/query/wiki', {
        params: {
          sitename: sitename,
          sortby: '_total',
          sortorder: -1,
          prop: '_total|url|sitename|users'
        }
      }).then(res => {
        var wikis = res.data.query
        var msg = []
        if (wikis.length > 0) {
          if (sitename === '') {
            msg.push('InPageEdit排行榜')
          } else {
            msg.push('InPageEdit信息查询')
            msg.push(`关键词“${sitename}”共匹配到${wikis.length}个相关wiki~`)
          }
          var limit = 3
          if (limit > wikis.length) {
            limit = wikis.length
          } else {
            msg.push('* 只显示前3个')
          }
          msg.push('')
          for (let i = 0; i < limit; i++) {
            msg.push(`${wikis[i].sitename}`)
            msg.push(`├ 链接: ${wikis[i].url}`)
            msg.push(`├ 次数: ${wikis[i]._total}`)
            msg.push(`└ 人数: ${Object.keys(wikis[i].users).length}`)
            msg.push('')
          }
          msg.push(`(查询耗时${(new Date().getTime() - before) / 1000}秒)`)
        } else {
          msg = [
            `关键词“${sitename}”共匹配到${wikis.length}个相关wiki~`,
            '试试别的关键词吧！'
          ]
        }
        meta.$send(msg.join('\n'))
      })
    })

  /**
   * @module cmd-about
   */
  app.command('about', '显示SILI的相关信息').alias('自我介绍', '关于', 'sili').action(({ meta }) => {
    meta.$send([
      '✨ 自我介绍',
      '你好，我是Sara Lindery，你的人工智障助理，你也可以叫我SILI~',
      '很多人认为我的名字取自苹果公司的语音助理Siri，其实是出自单词silly，意思是笨蛋。',
      '⚡ 更多信息',
      '我的创造者是[CQ:at,qq=824399619]',
      '我的人设可以在这里查看: https://epbureau.fandom.com/index.php?curid=884'
    ].join('\n'))
  })

  /**
   * @module util-replyBaka
   * @description 监听消息，如果发现你在骂她，就卖萌
   */
  app.receiver.on('message', meta => {
    // SILI的称呼
    var siliName = [
      'sili',
      'sara ?lindery',
      'xiaoyujunbot',
      'silibot',
      'at,qq=3338556752' // 在群聊里@她
    ].join('|')
    // 表示贬低她的词语
    var bakaWords = [
      '智障',
      '人工智障',
      '人工窒能',
      '笨蛋',
      '白痴',
      '傻瓜',
      '蠢[蛋货]',
      'baka',
      '⑨'
    ].join('|')

    // 给爷来一个天下无敌的正则表达式，再加一碟茴香豆
    var isBaka = new RegExp('.*(?:' + siliName + ').*[是就]?.*(' + bakaWords + ').*', 'ig')

    // 如果判定是在骂她，立刻卖萌
    if (
      isBaka.test(meta.message)
    ) {
      // 你是怎么称呼她的
      var callName = meta.message.replace(isBaka, '$1')
      // 她就怎么回应你
      var reply = random([
        '?你说谁是' + callName + '呢¿',
        '别骂了，别骂了，我真的不是' + callName + '！呜呜呜，再骂孩子就傻了……',
        '你才是' + callName + '呢，哼！'
      ])
      // 芜湖起飞~
      meta.$send(reply)
    }
  })

  /**
   * @methid 事件监听
   */
  // 收到消息
  app.receiver.on('message', meta => {
    // 保留记录
    switch (meta.messageType) {
      case 'private':
        sysLog('✉', '收到私信', meta.userId, meta.message)
        break
      case 'group':
        sysLog('✉', '收到群消息', '群' + meta.groupId, '用户' + meta.sender.userId, meta.message)
        break
      default:
        sysLog('✉', '收到其他消息', '类型' + meta.messageType, '用户' + meta.sender.userId, meta.message)
        break
    }
    // 判断用户是否存在
    if (meta.sender.userId) {
      app.database.getUser(meta.sender.userId).then(res => {
        // console.log('用户信息', res)
        if (res.authority < 1) {
          // 初始化用户数据
          app.database.mysql.query("INSERT INTO `user` (`id`, `flag`, `authority`, `usage`) VALUES ('" + meta.sender.userId + "', '0', '1', '{}');").then(create => {
            console.log('新建用户数据', create)
          })
        }
      })
    }
    // 判断群是否存在
    if (meta.groupId) {
      app.database.getGroup(meta.groupId).then(res => {
        // 初始化群数据
        if (res.flag === 3) {
          app.database.mysql.query("INSERT INTO `group` (`id`, `flag`, `assignee`) VALUES ('" + meta.groupId + "', '0', '0');")
        }
      })
    }
  })

  // 好友申请
  app.receiver.on('request/friend', meta => {
    var answer = meta.comment.replace(/.*\n回答:(.+)\n.*/i, '$1')
    var user = meta.userId
    var approve = false
    if (/(机智的小鱼君|dragon fish|xiaoyujun)/ig.test(meta.comment)) {
      meta.$approve()
      approve = true
    } else {
      meta.$reject('不对不对，不要随便回答啊！')
    }
    sysLog('💌', '收到好友申请', '用户' + user, '回答:' + answer, approve ? '√通过' : '×拒绝')
  })

  // 添加好友
  app.receiver.on('friend-add', meta => {
    console.log('❤', '已添加好友', meta)
  })

  // 入群申请
  app.receiver.on('request/group/add', meta => {
    console.log('💭', '收到入群申请', meta)
  })

  // 加群邀请
  app.receiver.on('request/group/invite', meta => {
    sysLog('💌', '收到加群邀请', '群' + meta.groupId, '√通过')
    meta.$approve()
  })

  // 群成员增加
  app.receiver.on('group-increase', meta => {
    sysLog('🔰', '检测到群成员增加', '群' + meta.groupId, '用户' + meta.userId)
    if (meta.userId === meta.selfId) {
      sysLog('💌', '检测到加入群聊，发送自我介绍')
      // app.executeCommandLine('about', meta)
    }
  })

  // 群成员减少
  app.receiver.on('group-decrease', meta => {
    console.log('💔', '检测到群成员减少', meta)
  })

  // 群管理变动
  app.receiver.on('group-admin', meta => {
    sysLog('🔰', '发生群管理员变动', '群' + meta.groupId, '用户' + meta.userId, Boolean(meta.subType === 'set') ? '+上任' : '-撤销')
  })

  // 指令调用
  app.receiver.on('command', (data) => {
    sysLog('🤖', '发生指令调用事件', data.meta.userId, '触发指令:' + data.command.name)
  })

  // 收到小鱼君私信
  app.user(qqNumber.user.xiaoyujun).command('sudo')
    .action(({ meta }) => {
      if (meta.$user.authority >= 4) {
        meta.$send('already')
        return
      } else {
        app.database.mysql.query("UPDATE `user` SET `authority` = '4' WHERE `user`.`id` = " + qqNumber.user.xiaoyujun + ";").then(res => {
          meta.$send('done')
        })
        sysLog('🤖', '小鱼君已将自己设置为4级权限')
      }
    })

  /** @end */
  sysLog('🌈', 'koishi进程重新加载')
}
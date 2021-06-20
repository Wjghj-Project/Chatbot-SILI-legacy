const { segment } = require('koishi-utils')

function apply(koishi, pluginOpt) {
  koishi
    .command('admin/dbadmin', '数据库管理', { authority: 4 })
    .example('dbadmin.set 更新值\ndbadmin.get 获取值')
    .action(({ session }) => {
      session.execute('dbadmin -h')
    })

  koishi
    .command('admin/dbadmin.set <key> <val>', { authority: 4 })
    .example(
      'dbadmin.set --user=onebot:123456 nickname foo 将标识符为onebot:123456的用户数据中的nickname字段值修改为foo'
    )
    .option('user', '-u <uid>', { type: 'string' })
    .option('channel', '-c <channel>', { type: 'string' })
    .action(async ({ session, options: opt }, key, val) => {
      if (!key || !val || (!opt.user && !opt.channel)) {
        let mis = []
        if (!key) mis.push('key')
        if (!val) mis.push('val')
        if (!opt.user || !opt.channel) mis.push('指定用户或群聊的参数')
        return `缺少参数：${mis.join(', ')}。`
      }

      if (opt.user && opt.user !== true) {
        let { platform, id } = parseUser(opt.user)
        if (!platform || !id)
          return '未指定用户所在平台，您指的可能是：onebot:' + opt.user

        let data = {}
        data[key] = val

        await session.database.setUser(platform, id, data)

        session.send(
          `用户信息已修改：\n用户：${platform}:${id}\n键：${key}\n值：${val}`
        )
        return
      }

      return '不支持的操作。\n$(dbadmin.set -h)'
    })

  koishi
    .command('admin/dbadmin.get <key>', { authority: 4 })
    .example(
      'dbadmin.get --user=onebot:123456 nickname 获取标识符为onebot:123456的用户数据中的nickname字段的值'
    )
    .option('user', '-u <uid>', { type: 'string' })
    .option('channel', '-c <channel>', { type: 'string' })
    .action(async ({ session, options: opt }, key) => {
      console.log(opt)

      if (!key || (!opt.user && !opt.channel)) {
        let mis = []
        if (!key) mis.push('key')
        if (!opt.user || !opt.channel) mis.push('指定用户或群聊的参数')
        return `缺少参数：${mis.join(', ')}。`
      }

      if (opt.user && opt.user !== true) {
        let { platform, id } = parseUser(opt.user)
        if (!platform || !id)
          return '未指定用户所在平台，您指的可能是：onebot:' + opt.user

        let ret = await session.database.getUser(platform, id, key.split(','))
        console.log(ret)

        session.send(
          `用户 ${platform}:${id} 的信息：\n${JSON.stringify(ret, null, 2)}`
        )
        return
      }

      return '不支持的操作。\n$(dbadmin.set -h)'
    })
}

function parseUser(user) {
  if (user.indexOf('[CQ:at') > -1) {
    let segObj = segment.from(user)
    user = segObj.data.id || segObj.data.qq
    user = 'onebot:' + user
  }
  user = user.split(':')
  if (user.length < 2) {
    // return '未指定用户所在平台，您指的可能是：onebot:' + opt.user
    return {}
  }
  return { platform: user[0], id: user[1] }
}

module.exports = {
  name: 'database-admin',
  apply,
}

const { koishi } = require('..')

module.exports = () => {
  koishi
    .command('admin/sudo <cmd:text>', 'Super user do', { authority: 0 })
    .alias('root')
    .option('add', '-a <user:user>', { hidden: true })
    .option('remove', '-r <user:user>', { hidden: true })
    .userFields(['uuid', 'authority', 'authoritySuper'])
    .before(({ session, options }, cmd) => {
      koishi.logger('sudo').info({ user: session.user, options, cmd })
      if (session.user.authoritySuper !== true) {
        return '您不是超级管理员。'
      }
    })
    .before(async ({ session, options }) => {
      if (options.add || options.remove) {
        const s = options.add
          ? options.add.split(':')
          : options.remove.split(':')
        const pid = s[0]
        const uid = s[1]
        try {
          await session.database.setUser(pid, uid, {
            authoritySuper: Boolean(options.add),
          })
          return `已${options.add ? '添加' : '移除'}超级管理员。`
        } catch (err) {
          return `修改配置时出现问题：${err.message}`
        }
      }
    })
    .action(async ({ session }, cmd) => {
      if (!cmd) return session.execute('sudo -h')

      const orgAuth = session.user.authority
      const sudoAuth = Date.now()
      session.user.authority = sudoAuth
      await session.user._update()
      await session.execute(cmd)
      if (session.user.authority === sudoAuth) {
        await session.user._update()
        session.user.authority = orgAuth
      }
    })
}

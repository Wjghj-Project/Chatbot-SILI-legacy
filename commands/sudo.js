const { koishi } = require('..')

module.exports = () => {
  koishi
    .command('admin/sudo <cmd:text>', 'Super User Do', { authority: 0 })
    .option('add', '-a <user:user>', { hidden: true })
    .option('remove', '-r <user:user>', { hidden: true })
    .userFields(['authority', 'authoritySuper'])
    .check(({ session, options }, cmd) => {
      koishi
        .logger('sudo')
        .info({ authoritySuper: session.user.authoritySuper, options, cmd })
      if (session.user.authoritySuper !== true) {
        return '权限不足。'
      }
    })
    .check(async ({ session, options }) => {
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
          return `已保存配置。`
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

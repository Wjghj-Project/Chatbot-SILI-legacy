const { koishi } = require('..')
const list = require('../secret/sudoer')

module.exports = () => {
  koishi
    .command('sudo <cmd:text>', 'Super User Do', { authority: 0 })
    .userFields(['authority'])
    .action(async ({ session }, cmd) => {
      if (!list.find(({ uid }) => uid === session.userId)) {
        return '权限不足。'
      }

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

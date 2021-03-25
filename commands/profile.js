const { koishi } = require('../')

module.exports = () => {
  koishi
    .command('admin/profile', '', {})
    .userFields(['authority', 'name'])
    .action(({ session }) => {
      return [
        '基本资料',
        `昵称：${session?.user?.name || '无'}`,
        `权限：${session?.user?.authority || 0}`,
      ].join('\n')
    })
}

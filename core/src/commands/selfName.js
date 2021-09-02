const { koishi } = require('../')
const resolveBrackets = require('../utils/resolveBrackets')

module.exports = () => {
  koishi
    .group()
    .command('admin/siliname <name:text>', '', { authority: 3 })
    .action(async ({ session }, name) => {
      if (!name) return
      try {
        name = resolveBrackets(name)
        await session.bot.$setGroupCard(
          session.groupId,
          session.bot.selfId,
          name
        )
        return `好的，请叫我 ${name}`
      } catch (err) {
        return '修改群名片时出现问题。'
      }
    })
}

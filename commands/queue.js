const { sleep } = require('koishi-core')
const { koishi } = require('../')

module.exports = () => {
  koishi
    .command('admin/queue <commands:text>', '指令队列', { authority: 3 })
    .action(async ({ session }, cmds) => {
      if (!cmds) return
      const cmdList = cmds.split('\n')
      async function ex(list, index) {
        const cmd = list[index]
        if (cmd) {
          await session.execute(cmd)
        }
        if (index + 1 < list.length) {
          await sleep(1000)
          await ex(list, index + 1)
        }
      }
      ex(cmdList, 0)
    })
}

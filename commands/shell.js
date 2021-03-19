const { koishi } = require('../')

module.exports = () => {
  koishi
    .command('admin/sh <cmd:text>', '执行shell命令', { authority: 4 })
    .action(async ({ session }, cmd) => {
      if (!cmd) return
      // cmd = segment
      return new Promise(resolve => {
        const { exec } = require('child_process')
        const child = exec(cmd, {
          timeout: 15 * 1000,
          encoding: 'utf-8',
          shell:
            'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
        })
        child.stdout.on('data', data => session.send(String(data).trim()))
        child.stderr.on('data', data => session.send(String(data).trim()))
        child.on('close', resolve)
      })
    })
}

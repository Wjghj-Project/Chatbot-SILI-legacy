const { segment } = require('koishi-utils')
const { koishi } = require('../')

module.exports = () => {
  koishi
    .command('admin/sh <cmd:text>', '执行shell命令', { authority: 4 })
    .option('timeout', '-t <s:number> 超时时间，单位秒，最小10秒，最大120秒')
    .action(async ({ session, options }, cmd) => {
      if (!cmd) return

      let timeout = 15
      if (options.timeout) {
        if (typeof options.timeout === 'number') timeout = options.timeout
        timeout = Math.min(120, timeout)
        timeout = Math.max(10, timeout)
      }

      await session.send(
        [
          `${segment('quote', { id: session.messageId })}指令：${cmd}`,
          `限时：${timeout} 秒`,
        ].join('\n')
      )

      return new Promise(resolve => {
        const { exec } = require('child_process')
        const start = Date.now()
        const child = exec(cmd, {
          timeout: timeout * 1000,
          encoding: 'utf-8',
          shell:
            'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
          windowsHide: false,
        })
        child.stdout.on('data', data => {
          session.sendQueued(String(data).trim(), 500)
        })
        child.stderr.on('data', data => {
          session.sendQueued(String(data).trim(), 500)
        })
        child.on('close', () => {
          session.sendQueued(
            `[执行完毕]\n耗时：${((Date.now() - start) / 1000).toFixed(2)} 秒`,
            500
          )
          resolve()
        })
      })
    })
}

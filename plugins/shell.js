/**
 * @name koishi-plugin-shell
 * @author 机智的小鱼君
 *
 * @license Apache-2.0
 */

const { exec } = require('child_process')
const { template, interpolate } = require('koishi-utils')

template.set('shell', {
  desc: '执行shell命令',
  option_timeout:
    '超时时间，单位秒，最小 {{ minTimeout }} 秒，最大 {{ maxTimeout }} 秒',
  option_cwd: '指定执行的工作路径',
  on_start: '[执行指令] {{ cmd }}\n限时：{{ timeout }} 秒',
  on_close:
    '[执行完毕] {{ cmd }}\b耗时：{{ time }} 秒\n退出码：{{ code }}，终止信号：{{ signal }}',
})

function apply(koishi, pOptions) {
  pOptions = {
    encoding: 'utf-8',
    shell: undefined,
    defaultTimeout: 30,
    maxTimeout: 180,
    minTimeout: 10,
    ...pOptions,
  }

  koishi
    .command('admin/sh <cmd:text>', template('shell.desc'), { authority: 4 })
    .option(
      'timeout',
      `-t <s:number> ${interpolate(template('shell.option_timeout'), {
        minTimeout: pOptions.minTimeout,
        maxTimeout: pOptions.maxTimeout,
      })}`
    )
    .option('cwd', `<cwd> ${template('shell.option_cwd')}`)
    .action(async ({ session, options }, cmd) => {
      if (!cmd) return

      let timeout = pOptions.defaultTimeout
      if (options.timeout) {
        if (typeof options.timeout === 'number') timeout = options.timeout
        timeout = Math.min(pOptions.maxTimeout, timeout)
        timeout = Math.max(pOptions.minTimeout, timeout)
      }

      await session.send(
        interpolate(template('shell.on_start'), { cmd, timeout })
      )

      return new Promise(resolve => {
        const start = Date.now()
        const child = exec(cmd, {
          timeout: timeout * 1000,
          cwd: options.cwd,
          encoding: pOptions.encoding,
          shell: pOptions.shell,
          windowsHide: true,
        })
        child.stdout.on('data', data => {
          session.sendQueued(String(data).trim(), 500)
        })
        child.stderr.on('data', data => {
          session.sendQueued(String(data).trim(), 500)
        })
        child.on('close', (code, signal) => {
          session.sendQueued(
            interpolate(template('shell.on_close'), {
              cmd,
              time: ((Date.now() - start) / 1000).toFixed(2),
              code,
              signal,
            }),
            500
          )
          resolve()
        })
      })
    })
}

module.exports = {
  name: 'shell',
  apply,
}

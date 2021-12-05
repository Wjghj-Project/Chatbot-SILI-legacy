const { koishi } = require('..')

module.exports = () => {
  koishi
    .command('version', '查看 bot 版本信息', { hidden: 1 })
    .alias('v')
    .action(async () => {
      const { appVersion: onebotVer } =
        (await koishi.bots[0].$getVersionInfo()) || '-'
      const packageInfo = require('../../package.json')
      const coreVer = require('../../../package.json').version
      const { dependencies } = packageInfo
      const koishiPlugs = Object.keys(dependencies)
        .filter((item) => item.startsWith('koishi-'))
        .map((item) => `${item.replace(/^koishi-/, '')}: ${dependencies[item]}`)
      const versionMsg = [
        `SILI Core: ${coreVer}`,
        `OneBot: ${onebotVer}`,
        `koishi: ${packageInfo.dependencies.koishi}`,
        '  ' + koishiPlugs.join('\n  '),
      ].join('\n')
      return versionMsg
    })
}

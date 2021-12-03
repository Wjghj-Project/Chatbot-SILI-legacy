const { koishi } = require('..')

module.exports = () => {
  koishi
    .command('version', '查看 bot 的版本信息')
    .alias('v')
    .action(async () => {
      const { app_full_name: onebotVer } =
        (await koishi.bots
          .find((i) => i.platform === 'onebot')
          ?.internal?.getVersionInfo()) || '-'
      const packageInfo = require('../../package.json')
      const { dependencies } = packageInfo
      const koishiPlugs = Object.keys(dependencies)
        .filter(
          (item) => item.startsWith('koishi-') || item.startsWith('@koishijs/')
        )
        .map(
          (item) =>
            `${item.replace(/^(koishi-|@koishijs\/)/, '')}: ${
              dependencies[item]
            }`
        )
      const versionMsg = [
        `SILI Core: ${packageInfo.version}`,
        `OneBot: ${onebotVer}`,
        `koishi: ${packageInfo.dependencies.koishi}`,
        '  ' + koishiPlugs.join('\n  '),
      ].join('\n')
      return versionMsg
    })
}

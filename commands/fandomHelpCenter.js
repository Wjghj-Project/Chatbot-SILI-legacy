/**
 * @module command-fandomHelpCenter
 */
module.exports = ({ koishi }) => {
  koishi
    .command('fandom-help-center', '回应Fandom的帮助中心链接的快捷方式')
    .alias('fandom-help')
    .action(({ meta }) => {
      meta.$send(
        [
          '遇到不懂的问题，可以先查看Fandom帮助中心：',
          '• 帮助中心 https://community.fandom.com/zh/index.php?curid=2713',
          '• 编辑入门 https://community.fandom.com/zh/index.php?curid=5075',
          '• Wikitext https://community.fandom.com/zh/index.php?curid=6646',
          '• Wiki设计 https://community.fandom.com/zh/index.php?curid=8373',
        ].join('\n')
      )
    })
}

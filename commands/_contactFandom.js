/**
 * @module command-contactFandom
 */
module.exports = ({ koishi }) => {
  koishi
    .command('contact-fandom', '回应Fandom的zendesk链接的快捷方式')
    .alias('fandom-zendesk')
    .action(({ meta }) => {
      meta.$send(
        [
          '联系Fandom官方，提交申请、反馈问题等，可以前往Zendesk发送工单：',
          'https://fandom.zendesk.com/hc/en-us/requests/new',
        ].join('\n')
      )
    })
}

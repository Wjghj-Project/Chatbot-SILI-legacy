/**
 * @param {import('koishi').Context} ctx
 */
function apply(ctx) {
  ctx = ctx.platform('onebot').channel()
  ctx
    .command('channel.mute', '<duration:number>', { authority: 3 })
    .option('set-user', '-u <user:user>')
    .option('set-all', '-a', { type: 'boolean' })
    .action(({ session, options }, duration) => {
      console.info('[MUTE]', options, duration)
      if (options['set-all']) {
        session.bot.$setGroupWholeBan(session.channelId, +duration > 0)
      }
      if (options['set-user']) {
        session.bot.$setGroupBan(session.channelId, session.userId, +duration)
      }
    })
}

module.exports.apply = apply
module.exports.name = 'Mute'

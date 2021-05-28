const { koishi } = require('..')
const { name, version, homepage, repository } = require('../package.json')

module.exports = () => {
  koishi.router.get('/api', (ctx, next) => {
    ctx.body = {
      name,
      version,
      homepage,
      repository,
      bots: koishi.bots.map(({ platform, avatar, username, userId }) => {
        return { platform, avatar, username, userId }
      }),
    }
    next()
  })
}

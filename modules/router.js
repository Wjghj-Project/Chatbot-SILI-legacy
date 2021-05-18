const { koishi } = require('..')
const { name, version, homepage, repository } = require('../package.json')

module.exports = () => {
  koishi.router.get('/api', (ctx, next) => {
    ctx.body = { name, version, homepage, repository }
    next()
  })
}

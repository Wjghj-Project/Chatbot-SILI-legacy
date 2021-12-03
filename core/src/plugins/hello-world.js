/**
 * @param {import('koishi').Context} ctx
 */
function apply(ctx) {
  ctx.middleware((s, n) => (s.content === 'ping' ? s.send('pong') : n()))
}

module.exports = {
  name: 'hello-world',
  apply,
}

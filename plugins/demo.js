function apply(ctx) {
  ctx.middleware((session, next) => {
    if (session.content === '天王盖地虎') session.send('宝塔镇河妖')
    return next()
  })
}

module.exports = {
  name: 'demo',
  apply,
}

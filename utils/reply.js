const { s } = require('koishi')

module.exports = (session, msg) => {
  if (session && session.messageId && session.send) {
    session.send(`${s('quote', { id: session.messageId })}${msg || ''}`)
  } else {
    return false
  }
}

module.exports = (session, msg) => {
  if (session && session.messageId && session.send) {
    session.send(`[CQ:reply,id=${session.messageId}]${msg || ''}`)
  } else {
    return false
  }
}

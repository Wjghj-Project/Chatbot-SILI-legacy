module.exports = (meta, msg) => {
  if (meta && meta.messageId && meta.$send) {
    meta.$send(`[CQ:reply,id=${meta.messageId}]${msg || ''}`)
  } else {
    return false
  }
}

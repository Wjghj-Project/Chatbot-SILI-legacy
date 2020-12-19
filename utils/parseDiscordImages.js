module.exports = ({ msg, content }) => {
  if (msg.attachments) {
    try {
      var atc = JSON.stringify(msg.attachments)
      atc = JSON.parse(atc)
      if (atc[0]) {
        var img = atc[0].attachment
        // content += '[CQ:image,file=' + img + ']'
        // content += img
        content += '(附图：图片请前往 Discord 查看)'
      }
    } catch (e) {
      console.error('转换图片出错', e)
    }
  }
  return content
}

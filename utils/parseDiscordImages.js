module.exports = ({ msg, content }) => {
  if (msg.attachments) {
    try {
      var atc = JSON.stringify(msg.attachments)
      atc = JSON.parse(atc)
      if (atc[0]) {
        var img = atc[0].attachment
        // content += '[CQ:image,file=https://pd.zwc365.com/cfworker/' + img + ']'
        content += '\n附图：' + img
      }
    } catch (e) {
      console.error('转换图片出错', e)
    }
  }
  return content
}

const axios = require('axios').default

module.exports = ({ msg, content }) => {
  if (msg.attachments) {
    try {
      var atc = JSON.stringify(msg.attachments)
      atc = JSON.parse(atc)
      if (atc[0]) {
        var img = atc[0].attachment
        // content += '[CQ:image,file=' + img + ']'
        // content += img
        content += `[附图] ${img}`
        axios.post(require('../secret/discord').fandom_zh.webhook, {
          username: 'SILI',
          content:
            '[INFO] 由于政策原因，QQ 用户无法看到来自 Discord 的图片，请使用图床等工具展示图片。',
          avatar_url: 'https://i.loli.net/2021/03/01/BX9mLQdxaTzYEV3.jpg',
        })
      }
    } catch (e) {
      console.error('转换图片出错', e)
    }
  }

  return content
}

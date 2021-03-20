const axios = require('axios').default
const { s } = require('koishi-utils')

module.exports = ({ session, content }) => {
  if (/cq:image/gi.test(content)) {
    content = content.replace(/\[cq:image,url=(.+?),.+\]/gi, '[图片] $1')
    session.send(
      `${s('quote', {
        id: session.messageId,
      })}由于政策原因，QQ 用户无法看到来自 Discord 的图片，请使用图床等工具展示图片。%bridge-disabled%`
    )
    return content
  }

  return content
}

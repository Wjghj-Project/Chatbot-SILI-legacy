const { s } = require('koishi')
const { koishi } = require('..')
const txt2img = require('../utils/txt2img')

module.exports = () => {
  koishi.command('tools/sticker', '生成表情包')

  koishi
    .command('sticker.original-main-said [content:text]', '沃里杰诺·梅因说')
    .action(async ({ session }, content) => {
      try {
        return await txt2img.shotHtml(
          `
      <div
        style="position: relative; display: inline-block; {{{style}}}"
        id="sticker"
        >
      <img
        src="https://i.loli.net/2021/07/25/CnBp6z3y8WFAJ4d.jpg"
        style="display: inline-block; width: 250px; height: 250px;"
      />
      <div style="
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        margin-top: 35px;
      ">${content}</div>
      </div>
      `,
          '#sticker'
        )
      } catch (err) {
        return '生成表情包时出现问题。'
      }
    })
}

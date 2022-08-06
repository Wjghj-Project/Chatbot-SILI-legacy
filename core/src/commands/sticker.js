const { s, Time, Logger } = require('koishi')
const { koishi } = require('..')
const logger = new Logger('cmd.sticker')

module.exports = () => {
  koishi.command('tools/sticker', '生成表情包')

  koishi
    .command('sticker.original-main-said [content:text]', '沃里杰诺·梅因说', {
      minInterval: Time.minute,
    })
    .action(async ({ session }, content) => {
      try {
        const page = await session.app.puppeteer.page()
        await page.setContent(
          `
<div
  style="position: relative; display: inline-block;"
  id="sticker"
  >
<img
  src="https://i.loli.net/2021/07/25/CnBp6z3y8WFAJ4d.jpg"
  style="display: inline-block; width: 250px; height: 250px;"
/>
<div style="
  position: absolute;
  top: 0;
  left: 0;
  height: 100px;
  width: 100%;
">
<div style="
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
</div>
</div>
      `
        )
        const el = await page.$('#sticker')
        const img = await el.screenshot({})
        await page.close()
        return s.image(img)
      } catch (err) {
        logger.warn(err)
        return '生成表情包时出现问题。'
      }
    })
}

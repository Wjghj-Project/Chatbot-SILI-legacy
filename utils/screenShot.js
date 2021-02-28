const puppeteer = require('puppeteer')

module.exports = async url => {
  if (!url) return ''
  try {
    const browser = await puppeteer.launch({ headless: 1 })
    const page = await browser.newPage()
    await page.goto(url)
    const image = await page.screenshot()

    await browser.close()

    let base64 = image.toString('base64')
    // console.log(base64)
    return `[CQ:image,file=base64://${base64}]`
  } catch (e) {
    // console.log('error', e)
    return '截图时遇到问题：' + e
  }
}

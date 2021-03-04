const puppeteer = require('puppeteer')

module.exports = async (url, selector) => {
  if (!url) return ''
  const browser = await puppeteer.launch({ headless: 0 })
  try {
    const page = await browser.newPage()
    await page.goto(url)

    let image

    if (selector) {
      let area = await page.$(selector)
      image = await area.screenshot()
    } else {
      image = await page.screenshot()
    }

    await browser.close()

    let base64 = image.toString('base64')
    // console.log(base64)
    return `[CQ:image,file=base64://${base64}]`
  } catch (e) {
    // console.log('error', e)
    await browser.close()
    return '截图时遇到问题：' + e
  }
}

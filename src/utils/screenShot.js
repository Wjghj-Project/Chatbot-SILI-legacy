const puppeteer = require('puppeteer')
const { segment } = require('koishi-utils')
const path = require('path')

module.exports = async (url, selector) => {
  if (!url) return ''
  const browser = await puppeteer.launch({ headless: 0 })
  try {
    const page = await browser.newPage({})
    page.cookies()
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
    return segment('image', { url: 'base64://' + base64 })
  } catch (err) {
    // console.log('error', e)
    await browser.close()
    return `${segment('image', {
      url:
        'file:///' +
        path.resolve(__dirname, '../images/connection_err_firefox.png'),
    })}\n(截图时遇到问题：${err})`
  }
}

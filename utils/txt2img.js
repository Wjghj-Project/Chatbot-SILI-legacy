const puppeteer = require('puppeteer')
const { segment } = require('koishi-utils')
const path = require('path')
const { default: axios } = require('axios')
const resolveBrackets = require('./resolveBrackets')

class Main {
  constructor() {}
  shotText(text) {
    return this.shotHtml(
      `<pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`
    )
  }
  shotCode(content, lang = '') {
    const html = `
    <html>
    <head><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@9.12.0/styles/solarized-light.css"></head>
    <body>
    <pre id="hljs-codeblock" class="hljs ${
      lang ? 'lang-' + lang : ''
    }">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.3.1/build/highlight.min.js"></script>
    <script>(()=>{
      const blocks = document.getElementsByClassName('hljs')
        for (let item of blocks) {
          if (item.innerText.length > 100000) return
        hljs.highlightBlock(item)
      }
    })()</script>
    </body>
    </html>`
    return this.shotHtml(html, '#hljs-codeblock')
  }
  async shotMarkdown(text) {
    text = resolveBrackets(text)
    const { data } = await axios({
      method: 'post',
      url: 'https://api.github.com/markdown',
      headers: {
        'Content-Type': 'application/json',
      },
      data: { text: resolveBrackets(text) },
    })
    return this.shotHtml(data)
  }
  shotSvg(svg) {
    return this.shotHtml(svg, 'svg')
  }

  async shotHtml(html, selector = 'body') {
    if (!html) return ''
    const browser = await puppeteer.launch({ headless: 1 })
    try {
      const page = await browser.newPage({})
      await page.setContent(html)
      let element = await page.$(selector)
      const image = await element.screenshot()

      await browser.close()

      let base64 = image.toString('base64')
      // console.log(base64)
      return segment('image', { file: 'base64://' + base64 })
    } catch (err) {
      // console.log('error', e)
      await browser.close()
      return `${segment('image', {
        file:
          'file:///' +
          path.resolve(__dirname, '../images/connection_err_firefox.png'),
      })}\n(截图时遇到问题：${err})`
    }
  }
}

module.exports = new Main()

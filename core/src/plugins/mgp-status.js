const { Time, segment } = require('koishi')
const { default: axios } = require('axios')

/**
 * @param {import('koishi').Context} ctx
 */
function apply(ctx) {
  // ctx
  //   .command('tools/mgp-status', '萌娘百科炸了吗', {
  //     minInterval: 10 * Time.second,
  //   })
  //   .action(async ({ session }) => {
  //     const page = await ctx.puppeteer.page()
  //     let img
  //     try {
  //       await page.goto('https://ismoegirl.online/')
  //       img = await page.screenshot({
  //         type: 'jpeg',
  //         fullPage: true,
  //       })
  //     } catch (err) {
  //       await page.close()
  //       return `${segment.quote(session.messageId)}《萌娘百科炸了吗》似乎炸了 (${err.message})`
  //     }
  //     await page.close()
  //     return `${segment.quote(session.messageId)}${segment.image(img)}`
  //   })
  ctx
    .command('tools/mgp-status', '萌娘百科炸了吗', {
      minInterval: 10 * Time.second,
    })
    .action(async ({ session }) => {
      /** @type {{name:string;url:string;icon:string;status:'up'|'down';uptime:`${string}%`;uptimeDay:`${string}%`}[]} */
      let data
      try {
        ;({ data } = await axios.get(
          'https://github-raw-proxy.wjghj.workers.dev/Dragon-Fish/moegirl-uptime/master/history/summary.json'
        ))
      } catch (err) {
        return `${segment.quote(
          session.messageId
        )}啊哦，SILI暂时无法获取状态数据！`
      }
      return `${segment.quote(
        session.messageId
      )}【数据可能会有5-10分钟的延迟】\n${data
        .map(({ name, url, status, uptimeDay }) => {
          return `${name} ${
            status === 'up' ? '👍 挺好' : '👎 挂了'
          } (${uptimeDay} / 24h)`
        })
        .join('\n')}`
    })
}

module.exports = {
  name: 'mgp-status',
  apply,
}

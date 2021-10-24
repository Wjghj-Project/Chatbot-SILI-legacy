const { default: axios } = require('axios')
const { Time } = require('koishi-utils')

/**
 * @param {import('koishi').Context} ctx
 */
function apply(ctx) {
  ctx
    .command('tools/surl <url>', '', { minInterval: 10 * Time.second })
    .option('code', '-c <code>', { hidden: true, authority: 2 })
    .action(async ({ session }, url) => {
      if (!url) {
        session.send('请输入要缩短的网址：')
        url = await session.prompt()
        if (!url) return
      }
      try {
        const { data } = await axios.post('https://go.wjghj.cn/api', {
          long_url: url,
        })
        if (!data?.body?.short_url) throw { message: '发生未知错误。' }
        return `${data?.message || '已创建短链接'}:\nhttps://go.wjghj.cn/-/${
          data.body.short_url
        }`
      } catch (err) {
        return `未能创建短链接：${err?.response?.data?.message || err.message}`
      }
    })
}

module.exports = {
  name: 'wjghj-go',
  apply,
}

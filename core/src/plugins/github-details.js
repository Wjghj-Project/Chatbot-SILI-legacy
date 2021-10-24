const { default: axios } = require('axios')
const { segment } = require('koishi-utils')

/**
 * @param {import('koishi').Context} ctx
 */
function apply(ctx) {
  ctx
    .command('github.details', '<target:text> Get github user/repo details')
    .action(async ({ session }, target) => {
      if (target.includes('/')) {
        return session.execute(`github.details.repo ${target}`)
      } else {
        return session.execute(`github.details.user ${target}`)
      }
    })

  ctx
    .command('github.details.user', '<user:text>', { hidden: true })
    .action(async ({ session }, user) => {
      let data
      try {
        const res = await axios.get(
          `https://api.github.com/users/${user.trim()}`,
          ctx.app.options.axiosConfig
        )
        data = res.data
      } catch (err) {
        ctx.logger('ghDetails').warn(err)
        return `暂时无法连接到 GitHub${
          err.message ? '\n(' + err.message + ')' : ''
        }`
      }

      const {
        type,
        login,
        avatar_url,
        name,
        html_url,
        blog,
        bio,
        created_at,
        updated_at,
      } = data
      session.send(
        segment('quote', { id: session.messageId }) +
          [
            segment.image(avatar_url),
            `${type === 'Organization' ? '[组织]' : ''}${name})`,
            bio,
            html_url,
            `主页：${blog ? blog : '无'}`,
            `注册于 ${new Date(
              created_at
            ).toLocaleString()}，最近活跃于 ${new Date(
              updated_at
            ).toLocaleString()}`,
          ].join('\n')
      )

      const page = await ctx.puppeteer.page()
      try {
        await page.goto(`https://hub.fastgit.org/${login}`)
        const $readme = await page.$(
          type === 'Organization' ? '.orghead' : '.js-profile-editable-replace'
        )
        const readme = await $readme.screenshot({
          type: 'jpeg',
        })
        await session.send(segment.image(readme))
      } catch (err) {
        ctx.logger('ghDetails').warn('user 截图失败', err)
      }
      await page.close()
    })

  ctx
    .command('github.details.repo', '<repo:text>', { hidden: true })
    .action(async ({ session }, repo) => {
      let data
      try {
        const res = await axios.get(
          `https://api.github.com/repos/${repo.trim()}`,
          ctx.app.options.axiosConfig
        )
        data = res.data
      } catch (err) {
        ctx.logger('ghDetails').warn(err)
        return `暂时无法连接到 GitHub${
          err.message ? '\n(' + err.message + ')' : ''
        }`
      }

      const { html_url, homepage, language, updated_at, node_id, full_name } =
        data
      session.send(
        segment('quote', { id: session.messageId }) +
          [
            segment.image(
              `https://opengraph.github.com/${node_id}/${full_name}`
            ),
            html_url,
            `主页：${homepage ? homepage : '无'}`,
            `语言：${language}`,
            `更新：${new Date(updated_at).toLocaleString()}`,
          ].join('\n')
      )

      const page = await ctx.puppeteer.page()
      try {
        await page.goto(`https://hub.fastgit.org/${full_name}`)
        const $readme = await page.$('#readme')
        const readme = await $readme.screenshot({
          type: 'jpeg',
        })
        await session.send(segment.image(readme))
      } catch (err) {
        ctx.logger('ghDetails').warn('README 截图失败', err)
      }
      await page.close()
    })

  ctx.middleware(async (session, next) => {
    await next()
    const ghReg = /^(?:https?:\/\/)?github\.com\/(.+?)\/(.+)?/i
    const ghTest = ghReg.exec(session.content)
    if (!ghTest) return
    ghTest.shift()
    const [owner, repo] = ghTest

    session.execute(`github.details ${owner}${repo ? '/' + repo : ''}`)
  })
}

module.exports = {
  name: 'github/details',
  apply,
}

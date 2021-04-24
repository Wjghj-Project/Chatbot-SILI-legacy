const { default: axios } = require('axios')
const { template, segment } = require('koishi-utils')
const { koishi } = require('..')
const shot = require('../utils/screenShot')

template.set('github.api', {
  repos: 'https://api.github.com/repos/{{ owner }}/{{ repo }}',
})

module.exports = () => {
  koishi.middleware(async (session, next) => {
    await next()
    const repoReg = /^(?:https?:\/\/)?github\.com\/(.+?)\/(.+)/i
    const repoTest = repoReg.exec(session.content)
    // console.log(session.content, repoTest)
    if (!repoTest) return
    repoTest.shift()
    const [owner, repo] = repoTest
    if (repo.includes('/')) return

    let data
    try {
      const res = await axios.get(template('github.api.repos', { owner, repo }))
      data = res.data
    } catch (err) {
      koishi.logger('ghDetails').warn(err)
      return
    }

    const {
      name,
      description,
      homepage,
      language,
      stargazers_count,
      forks,
      updated_at,
    } = data
    session.send(
      segment('quote', { id: session.messageId }) +
        [
          `✨Star${stargazers_count} 🤺Fork${forks}`,
          `${name}: ${description}`,
          `主页：${homepage ? homepage : '无'}`,
          `语言：${language}`,
          `更新：${updated_at}`,
        ].join('\n')
    )

    try {
      const readme = await shot(
        `https://pd.zwc365.com/seturl/https://github.com/${owner}/${repo}`,
        'article.markdown-body'
      )
      session.send(readme)
    } catch (err) {
      return
    }
  })
}

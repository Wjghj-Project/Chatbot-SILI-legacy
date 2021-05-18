const axios = require('axios').default
const { Session } = require('koishi-core')

/**
 *
 * @param {Session} session
 * @param {*} options
 * @param {*} next
 * @returns
 */
async function verifyQQ(session, options) {
  var msg = '',
    status = false
  if (!options.user) {
    msg = '未指定用户名'
    return { msg, status }
  }

  const { userBlacklist } = await session.database.getChannel(
    session.platform,
    session.channelId,
    ['userBlacklist']
  )

  if (userBlacklist.includes(session.userId)) {
    msg = '验证失败，用户位于群黑名单。'
    status = false
    return { msg, status }
  }

  // 缓存变量
  var userName = options.user,
    qqNumber = options.qq || session.userId.replace('onebot:', ''),
    encodeNumber = require('./md5')(qqNumber),
    verifyNumber,
    lastEditor
  // 修正用户名 User: 前缀
  userName = userName.replace(/^user:/i, '')
  // 修正用户名空格
  userName = userName.replace(/_/g, ' ')
  // 修正用户名首字母大写
  userName = userName.split('')
  var _userNameFirst = userName.shift().toUpperCase()
  userName = _userNameFirst + userName.join('')

  const { data } = await axios.get('https://community.fandom.com/zh/api.php', {
    params: {
      format: 'json',
      action: 'parse',
      page: 'User:' + userName + '/verify-qq',
      prop: 'wikitext|revid',
    },
  })

  if (data.parse && data.parse.revid) {
    verifyNumber = data.parse.wikitext['*']
    if (verifyNumber !== encodeNumber) {
      status = false
      msg = [
        '[CQ:at,id=' +
          qqNumber +
          '] [' +
          userName +
          '] 验证失败，验证信息与QQ号不一致',
        'Fandom: ' + verifyNumber,
        'Yours: ' + encodeNumber,
      ].join('\n')
      return { msg, status }
    } else {
      axios
        .get('https://community.fandom.com/zh/api.php', {
          params: {
            format: 'json',
            action: 'query',
            prop: 'revisions',
            revids: data.parse.revid,
            rvprop: 'user',
          },
        })
        .then((res) => {
          var data = res.data
          var pageId = Object.keys(data.query.pages)[0]
          lastEditor = data.query.pages[pageId].revisions[0].user
          if (lastEditor === userName) {
            status = true
            msg =
              //
              `[CQ:at,id=${qqNumber}] [${userName}] 验证通过！`
          } else {
            status = false
            msg =
              '[CQ:at,id=' +
              qqNumber +
              '] [' +
              userName +
              '] 验证失败，最后编辑者为' +
              lastEditor +
              '！'
          }
          return { msg, status }
        })
    }
  } else {
    status = false
    msg =
      '[CQ:at,id=' +
      qqNumber +
      '] [' +
      userName +
      '] 验证失败，' +
      encodeURI(
        'https://community.fandom.com/zh/wiki/User:' + userName + '/verify-qq'
      ) +
      ' 不存在！'
    return { msg, status }
  }
}

module.exports = verifyQQ

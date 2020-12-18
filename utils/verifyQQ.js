const axios = require('axios').default

function verifyQQ(meta, options, next) {
  var msg = '',
    status = false
  if (!options.user) {
    // meta.$send('未指定用户名')
    msg = '未指定用户名'
    next && next({ msg, status })
    return
  }
  // 缓存变量
  var userName = options.user,
    qqNumber = options.qq || meta.sender.userId,
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
  axios
    .get('https://community.fandom.com/zh/api.php', {
      params: {
        format: 'json',
        action: 'parse',
        page: 'User:' + userName + '/verify-qq',
        prop: 'wikitext|revid',
      },
    })
    .then(res => {
      var data = res.data
      if (data.parse && data.parse.revid) {
        verifyNumber = data.parse.wikitext['*']
        if (verifyNumber !== encodeNumber) {
          status = false
          msg = [
            '[CQ:at,qq=' +
              qqNumber +
              '] [' +
              userName +
              '] 验证失败，验证信息与QQ号不一致',
            'Fandom: ' + verifyNumber,
            'Yours: ' + encodeNumber,
          ].join('\n')
          // meta.$send(ret)
          next && next({ msg, status })
          return
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
            .then(res => {
              var data = res.data
              var pageId = Object.keys(data.query.pages)[0]
              lastEditor = data.query.pages[pageId].revisions[0].user
              if (lastEditor === userName) {
                status = true
                msg =
                  '[CQ:at,qq=' + qqNumber + '] [' + userName + '] 验证通过！'
              } else {
                status = false
                msg =
                  '[CQ:at,qq=' +
                  qqNumber +
                  '] [' +
                  userName +
                  '] 验证失败，最后编辑者为' +
                  lastEditor +
                  '！'
              }
              next && next({ msg, status })
            })
        }
      } else {
        status = false
        msg =
          '[CQ:at,qq=' +
          qqNumber +
          '] [' +
          userName +
          '] 验证失败，' +
          encodeURI(
            'https://community.fandom.com/zh/wiki/User:' +
              userName +
              '/verify-qq'
          ) +
          ' 不存在！'
        next && next({ msg, status })
      }
    })
}

module.exports = verifyQQ

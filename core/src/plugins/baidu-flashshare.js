const { Buffer } = require('buffer')
const axios = require('axios').default

// Utils
const atob = (str) => Buffer.from(str, 'base64').toString()
const btoa = (str) => Buffer.from(str).toString('base64')
const atou = (str) => decodeURIComponent(escape(atob(str)))
const utoa = (str) => btoa(unescape(encodeURIComponent(str)))

/**
 * @param {string} str
 * @returns {Record<string, string>}
 */
const cookieToObj = (str) => {
  const o = {}
  str
    .split(';')
    .map((i) => {
      const [key, val] = i.split('=')
      return { key: key?.trim(), val: val?.trim() }
    })
    .forEach(({ key, val }) => {
      if (key) o[key] = val || ''
    })
  return o
}

class BaiduFlashShare {
  /**
   * @param {{bdstoken?: string; cookie: string}} params0
   */
  constructor({ bdstoken, cookie }) {
    if (bdstoken) this.bdstoken = bdstoken
    if (cookie) this.setCookie(cookie)
    this.endpoints = {
      saveFile: 'https://pan.baidu.com/api/rapidupload',
    }
  }

  setCookie(cookie) {
    this.cookie = cookie
    return this
  }

  getCookie() {
    const o = cookieToObj(this.cookie)
    return `BDUSS=${o.BDUSS}; STOKEN=${o.STOKEN}`
  }

  async initToken() {
    this.bdstoken = (
      await axios.get(
        'https://pan.baidu.com/api/gettemplatevariable?fields=["bdstoken"]',
        {
          headers: {
            cookie: this.getCookie(),
          },
        }
      )
    ).data?.result?.bdstoken
    return this
  }

  /**
   * @param {string} link
   * @returns {{ de_b64: string; md5: string; slice_md5: string; file_length: string; file_name: string; } | null}
   */
  parseMagicLink(link = '') {
    const isBdpan = /^bdpan:\/\//.test(link)
    const isPcs = /BaiduPCS-Go/.test(link)
    const isMengji = /.{32}#.{32}/.test(link)

    // variables
    let de_b64 = ''
    let md5 = ''
    let slice_md5 = ''
    let file_length = ''
    let file_name = ''
    let protocol = ''

    if (isBdpan) {
      protocol = 'PanDownload'
      de_b64 = atou(link)
      md5 = de_b64.match(/\|(.{32})\|/)[1]
      slice_md5 = de_b64.match(/\|([^\|]{32})$/)[1]
      file_length = de_b64.match(/\|([0-9]+)\|/)[1]
      file_name = de_b64.match(/^(.+?)\|/)[1]
    } else if (isPcs) {
      protocol = 'BaiduPCS-Go'
      file_length = link.match(/length=([0-9]+)/)[1]
      md5 = link.match(/-md5=(.{32})/)[1]
      slice_md5 = link.match(/-slicemd5\=(.{32})/)[1]
      file_name = link.match(/"(.+)"/)[1]
    } else if (isMengji) {
      protocol = '梦姬'
      md5 = link.match(/^(.{32})#/)[1]
      slice_md5 = link.match(/#(.{32})#/)[1]
      file_length = link.match(/#([0-9]+)#/)[1]
      file_name = link.match(/#[0-9]+#(.+)$/)[1]
    } else {
      return null
    }

    return {
      protocol,
      de_b64,
      md5,
      slice_md5,
      file_length,
      file_name,
    }
  }

  /**
   *
   * @param {string} magicLink
   * @param {`/${string}`?} path
   */
  saveFile(magicLink, path) {
    const { md5, slice_md5, file_length, file_name } =
      this.parseMagicLink(magicLink)
    path = path || file_name
    if (!path.startsWith('/')) path = `/${path}`
    return axios.post(
      `${this.endpoints.saveFile}`,
      new URLSearchParams({
        'content-length': file_length,
        'content-md5': md5.toLowerCase(),
        'slice-md5': slice_md5.toLowerCase(),
        path,
      }).toString(),
      {
        params: {
          bdstoken: this.bdstoken,
        },
        headers: {
          cookie: this.getCookie(),
        },
      }
    )
  }
}

/**
 * @param {import('koishi-core').Context} ctx
 * @param {{cookie: string; basePath?: `/${string}`}} param1
 */
async function apply(ctx, { cookie, basePath = '/' }) {
  const app = new BaiduFlashShare({
    cookie,
  })
  await app.initToken()
  ctx.logger('bdpan').debug('Got token', app.bdstoken)

  ctx
    .command(
      'tools/baidupan <magic:text>',
      'Baidu Netdist Flashshare Protocol',
      {}
    )
    .alias('bdp', 'bdpan', '百度闪存')
    .check(async ({ session, options }, magic) => {
      if (options.help) return session.execute('bdpan -h')
      const s = app.parseMagicLink(magic)
      ctx.logger('bdpan').info(s, app.getCookie())
      if (!s) return '无效的百度闪存魔力链接。'
      await session.send(
        `链接解析成功，正在保存。\n分享协议：${s.protocol}\n文件名称：${s.file_name}\n文件大小：${s.file_length}`
      )
    })
    .action(async ({ session }, magic) => {
      const { file_name } = app.parseMagicLink(magic)
      let path = basePath
      if (!path.startsWith('/')) path = '/' + path
      if (!path.endsWith('/')) path += '/'
      path += file_name

      return app.saveFile(magic, path).then(
        ({ data }) => {
          ctx.logger('bdpan').info(data)
          switch (data.errno) {
            case 2:
            case 404:
              return '转存失败：未知原因。'
            case -6:
              return '转存失败：用户凭据无效。'
            case -8:
              return '转存失败：同名文件冲突。'
            case 0:
              return `转存成功！\n文件已保存到：${data?.info?.path}`
          }
        },
        (err) => {
          ctx.logger('bdpan').warn(err)
        }
      )
    })
}

module.exports = {
  name: 'baidu-flashshare',
  apply,
}

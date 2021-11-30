// 75BFF09D15BE20CD5A209ECDD008B40A#AA77C1F06D0E1992F7BB02618C629023#189205110#211129a.rar

const { Buffer } = require('buffer')
const axios = require('axios').default

// Utils
const atob = (str) => Buffer.from(str, 'base64').toString('binary')
const btoa = (str) => Buffer.from(str, 'binary').toString('base64')
const atou = (str) => decodeURIComponent(escape(atob(str)))
const utoa = (str) => btoa(unescape(encodeURIComponent(str)))

class BaiduFlashShare {
  constructor(bdstoken) {
    this.bdstoken = bdstoken
    this.endpoints = {
      saveFle: 'https://pan.baidu.com/rest/2.0/xpan/file?method=create',
    }
  }

  /**
   * @param {string} url
   * @returns {{ de_b64: string; md5: string; slice_md5: string; file_length: string; file_name: string; } | null}
   */
  parseMagicLink(url = '') {
    const isBdpan = (url) => /^bdpan:\/\//.test(url)
    const isPcs = (url) => /BaiduPCS-Go/.test(url)
    const isMengji = (url) => /.{32}#.{32}/.test(url)

    // variables
    let de_b64 = ''
    let md5 = ''
    let slice_md5 = ''
    let file_length = ''
    let file_name = ''
    let protocol = ''

    if (isBdpan(url)) {
      protocol = 'bdpan'
      de_b64 = atou(url)
      md5 = de_b64.match(/\|(.{32})\|/)[1]
      slice_md5 = de_b64.match(/\|([^\|]{32})$/)[1]
      file_length = de_b64.match(/\|([0-9]+)\|/)[1]
      file_name = de_b64.match(/^(.+?)\|/)[1]
    } else if (isPcs(url)) {
      protocol = 'pcs'
      file_length = url.match(/length=([0-9]+)/)[1]
      md5 = url.match(/-md5=(.{32})/)[1]
      slice_md5 = url.match(/-slicemd5\=(.{32})/)[1]
      file_name = url.match(/"(.+)"/)[1]
    } else if (isMengji(url)) {
      protocol = 'mengji'
      md5 = url.match(/^(.{32})#/)[1]
      slice_md5 = url.match(/#(.{32})#/)[1]
      file_length = url.match(/#([0-9]+)#/)[1]
      file_name = url.match(/#[0-9]+#(.+)$/)[1]
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
   * @returns {Promise<{
   */
  saveFile(magicLink, path) {
    const { de_b64, md5, slice_md5, file_length, file_name } =
      this.parseMagicLink(magicLink)
    return axios.post(
      this.endpoints.saveFle,
      {
        size: file_length,
        block_list: JSON.stringify([md5.toLowerCase()]),
        path: path || file_name,
        rtype: 0,
      },
      {
        params: {
          bdstoken: this.bdstoken,
        },
      }
    )
  }
}

/**
 * @param {import('koishi-core').Context} ctx
 * @param {{bdstoken: string; basePath: string}} param1
 */
function apply(ctx, { bdstoken, basePath = '/' }) {
  const app = new BaiduFlashShare(bdstoken)

  ctx
    .command('bdpan <magic:text>', 'bdpan', {})
    .check(({ session }, magic) => {
      const s = app.parseMagicLink(magic)
      if (!s) return '无效的百度闪存魔力链接'
      session.send(
        `链接解析成功\n类型：${s.protocol}\n文件名：${s.file_name}\n文件大小：${s.file_length}`
      )
    })
    .action(({ session }, magic) => {
      return 'placeholder'
    })
}

module.exports = {
  name: 'baidu-flashshare',
  apply,
}

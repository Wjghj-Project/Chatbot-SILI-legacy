const path = require('path')
const reply = require('../utils/reply')
const { koishi } = require('../index')
const { segment } = require('koishi-utils')
const txt2img = require('../utils/txt2img')

module.exports = () => {
  /**
   * @module command-debug
   */
  koishi
    .command('debug', '运行诊断测试', { authority: 2 })
    .option('announcement', '<content:text> 发送群公告')
    .option('face', '[id:string] 发送QQ表情')
    .option('localimg', '本地图片')
    .option('reply [content:text]', '回复消息')
    .option('tts [text:text]', '基于文字发送tts语音消息')
    .option('urlimg <url>', '网络图片')
    .option('version', '-v 显示SILI的版本信息', { authority: 1 })
    .option('xml', '')
    .option('parser', '-p <message:text> 解析消息到消息段')
    .option('html', '<html:text>')
    .option('markdown', '-M <markdown:text>')
    .option('nothing', '')
    .action(async ({ session, options }) => {
      koishi.logger('!debug').info(options)

      if (
        options.announcement &&
        options.announcement !== '' &&
        session.bot.$sendGroupNotice
      ) {
        koishi
          .logger('!debug')
          .info('sendGroupNotice', session.groupId, options.announcement)
        session.bot.$sendGroupNotice(session.groupId, options.announcement)
      }

      if (options.nothing) {
        return true
      }

      if (options.parser) {
        const json = segment.parse(options.parser)
        return txt2img.shotCode(JSON.stringify(json, null, 2), 'json')
      }

      if (options.html) {
        return txt2img.shotHtml(options.html)
      }

      if (options.markdown) {
        return txt2img.shotMarkdown(options.markdown)
      }

      // face
      if (options.face || options.face === 0) {
        var faceId
        if (
          options.face === true ||
          /^[0-9]+$/.test(options.face) ||
          Number(options.face) < 0
        ) {
          faceId = '0'
        } else {
          faceId = options.face
        }
        // console.log(faceId)
        session.send(`${segment('face', { id: faceId })}`)
      }

      if (options.localimg) {
        session.send(
          `[CQ:image,url=file:///${path.resolve('./images/test.png')}]`
        )
      }

      if (options.tts) {
        session.send(`[CQ:tts,text=${options.tts || '这是一条测试消息'}]`)
      }

      if (options.urlimg) {
        session.send('wait...')
        session.send('[CQ:image,url=' + options.urlimg + ']')
      }

      if (options.reply) {
        reply(session, options.reply === true ? 'hello, world' : options.reply)
      }

      if (options.version) {
        const { appVersion: onebotVer } = await session.bot.$getVersionInfo()
        const packageInfo = require('../package.json')
        const { dependencies } = packageInfo
        let koishiPlugs = []
        Object.keys(dependencies).forEach(item => {
          if (/^koishi-/.test(item))
            koishiPlugs.push(
              `${item.replace(/^koishi-/, '')}: ${dependencies[item]}`
            )
        })
        const versionMsg = [
          `SILI Core: ${packageInfo.version}`,
          `OneBot: ${onebotVer}`,
          `koishi: ${packageInfo.dependencies.koishi}`,
          '  ' + koishiPlugs.join('\n  '),
        ].join('\n')
        session.send(versionMsg)
      }

      if (options.xml) {
        session.send(
          segment('xml', {
            data: `<?xml version="1.0" encoding="utf-8"?><msg serviceID="5" templateID="12345" brief="[分享]我在百词斩背单词" token="291b5af7377f4473120959aff69b58c8" timestamp="1616428713" nonce="145091819"><item layout="0"><image uuid="{ABA235F2-916E-D849-008D-BDA91066AAC8}.jpg" md5="ABA235F2916ED849008DBDA91066AAC8" GroupFiledid="2431688022" minWidth="100" minHeight="100" maxWidth="180" maxHeight="180"/></item><source name="百词斩" icon="http://i.gtimg.cn/open/app_icon/00/34/46/05//100344605_100_m.png?t=1613703206" appid="100344605" action="" i_actionData="" a_actionData="" url=""/></msg>`,
            resid: 5,
          }) +
            segment('image', {
              url:
                'http://gchat.qpic.cn/gchatpic_new/824399619/711890863-2431688022-ABA235F2916ED849008DBDA91066AAC8/0?term=3',
            })
        )
      }
    })
}

/**
 * @name koishi-plugin-qq-channel-patch
 * @author Dragon-Fish <dragon-fish@qq.com>
 *
 * @desc Temporary patch for QQ channel for koishi.js
 */

// Packages
const { CQBot } = require('koishi-adapter-onebot')
const { segment } = require('koishi-core')

/**
 * @param {import('koishi-core').Context} ctx
 */
function apply(ctx) {
  // Adjust guild cahnnelId
  ctx.on('message', (session) => {
    if (session.subtype === 'guild') {
      session.channelId = `guild:${session.guildId || ''}-${session.channelId}`
    }
  })

  ctx.before('command', ({ session }) => {
    // console.log('on-command', session, session.channel)
    if (session.subtype === 'guild') {
      session.channel.disabled = session?.channel?.disabled || []
    }
  })

  // Hack Adapter Onebot
  CQBot.prototype.sendMessage = function (channelId, content) {
    content = renderText(content)
    if (channelId.startsWith('private:')) {
      return this.sendPrivateMessage(channelId.slice(8), content)
    } else if (channelId.startsWith('guild:')) {
      return this.sendGuildMessage(channelId.slice(6), content)
    } else {
      return this.sendGroupMessage(channelId, content)
    }
  }
  CQBot.prototype.sendGuildMessage = async function (channel, content) {
    if (!content) return
    const [guildId, channelId] = channel.split('-')
    const session = this.createSession({
      content,
      subtype: 'guild',
      guildId,
      channelId,
    })
    if (this.app.bail(session, 'before-send', session)) return
    session.messageId = (
      await this.get('send_guild_channel_msg', {
        guild_id: guildId,
        channel_id: channelId,
        message: content,
      })
    )?.messageId
    this.app.emit(session, 'send', session)
    return session.messageId
  }
}

function renderText(source) {
  return segment.parse(source).reduce((prev, { type, data }) => {
    if (type === 'at') {
      if (data.type === 'all') return prev + '[CQ:at,qq=all]'
      return prev + `[CQ:at,qq=${data.id}]`
    } else if (['video', 'audio', 'image'].includes(type)) {
      if (type === 'audio') type = 'record'
      if (!data.file) data.file = data.url
    } else if (type === 'quote') {
      type = 'reply'
    }
    return prev + segment(type, data)
  }, '')
}

module.exports = {
  name: 'qq-channel-patch',
  apply,
}

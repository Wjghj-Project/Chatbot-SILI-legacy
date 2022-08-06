const { Logger } = require('koishi')

// Utils
const logger = new Logger('mgp-utils')

// Constants
const KEYWORDS_BLACKLIST = ['测试禁言', 'hmoe', 'h萌娘?', 'vpn']
const COMMAND_WHITELIST = [
  // functions
  // 'wiki',
  // utils
  'ping',
  'dialogue',
  'teach',
  'schedule',
  'queue',
  'help',
  'switch',
  // administration
  'sudo',
  'echo',
  'auth',
  'user',
  'channel',
  'dbadmin',
  'siliname',
  'mute',
  'recall',
]
// const EXCEPTION_USERS = []

// Cache RegExp
const KEYWORDS_BLACKLIST_REG = new RegExp(
  `(${KEYWORDS_BLACKLIST.join('|')})`,
  'i'
)
const COMMAND_THITELIST_REG = new RegExp(`^(${COMMAND_WHITELIST.join('|')})`)

// function checkUserException() {}

/**
 * @param {import('koishi').Context} ctx
 */
function apply(ctx) {
  ctx = ctx.select('database').channel('727767855')

  // 指令白名单
  ctx.on('before-command', ({ command }) => {
    logger.info(command)
    if (!COMMAND_THITELIST_REG.test(command.name)) {
      logger.info('指令不在白名单，已阻断。')
      return ''
    }
  })

  // 自动禁言
  ctx.on('message', (sess) => {
    if (!KEYWORDS_BLACKLIST_REG.test(sess.content)) {
      return
    }
    let duration = 10 * 60
    sess.bot.$setGroupBan(sess.channelId, sess.userId, duration)
    sess.bot.deleteMessage(sess.channelId, sess.messageId)
  })
}

module.exports.apply = apply
module.exports.name = 'moegirl-group-utils'

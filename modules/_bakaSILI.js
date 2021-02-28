const siliQQ = require('../secret/qqNumber').user.sili
const random = require('../utils/random')

module.exports = ({ koishi }) => {
  /**
   * @module util-replyBaka
   * @description 监听消息，如果发现你在骂她，就卖萌
   */
  koishi.receiver.on('message', meta => {
    // SILI的称呼
    var siliName = [
      'sili',
      'sara\\s+?lindery',
      'xiaoyujunbot',
      'silibot',
      'at,qq=' + siliQQ, // 在群聊里@她
    ].join('|')
    // 表示贬低她的词语
    var bakaWords = [
      '智障',
      '人工智障',
      '人工窒能',
      '笨蛋',
      '白痴',
      '傻瓜',
      '蠢[蛋货]',
      'baka',
      '⑨',
    ].join('|')

    // 给爷来一个天下无敌的正则表达式，再加一碟茴香豆
    var isBaka = new RegExp(
      '.*(?:' + siliName + ').*[是就]?.*(' + bakaWords + ').*',
      'ig'
    )

    // 如果判定是在骂她，立刻卖萌
    if (isBaka.test(meta.message)) {
      // 你是怎么称呼她的
      var callName = meta.message.replace(isBaka, '$1')
      // 她就怎么回应你
      var reply = random([
        '?你说谁是' + callName + '呢¿',
        '别骂了，别骂了，我真的不是' + callName + '！呜呜呜，再骂孩子就傻了……',
        '你才是' + callName + '呢，哼！',
      ])
      // 芜湖起飞~
      meta.$send(reply)
    }
  })
}

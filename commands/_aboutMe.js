/**
 * @module command-about
 */
module.exports = ({ koishi }) => {
  koishi
    .command('about', '显示SILI的相关信息')
    .alias('自我介绍', '关于', 'sili')
    .action(({ session }) => {
      session.send(
        [
          '✨ 自我介绍',
          '你好，我是Sara Lindery，你的人工智障助理，你也可以叫我SILI~',
          '很多人认为我的名字取自苹果公司的语音助理Siri，其实是出自单词silly，意思是笨蛋。',
          '⚡ 更多信息',
          '我的创造者是[CQ:at,qq=824399619]',
          '我的人设可以在这里查看: https://epbureau.fandom.com/index.php?curid=884',
        ].join('\n')
      )
    })
}

const { koishi } = require('../index')
const { segment } = require('koishi')
const path = require('path')

/**
 * @module command-about
 */
module.exports = () => {
  koishi.command('about', '显示SILI的相关信息').action(({ session }) => {
    session.send(
      [
        segment('image', {
          url:
            'file:///' + path.resolve(__dirname, '../images/sili_avatar.jpg'),
        }),
        '✨ 自我介绍',
        '您好，我是SILI——「即时通讯软件转接姬」SILI-t137-[Tumita]-Invoke-II@LD(A)——来自Tumita序列的参与Invoke项目的后勤部II阶137号万界规划局跨界共享数据库自主学习型人工智能测试机，目前状态存活。',
        '很多人认为我的名字取自苹果公司的语音助理Siri，其实是出自单词silly，意思是笨蛋。',
        '⚡ 更多信息',
        '我的创造者是' + segment('at', { id: '824399619' }),
        '我的源码可以在这里查看(记得点✨哦): https://github.com/Wjghj-Project/Chatbot-SILI',
      ].join('\n')
    )
  })
}

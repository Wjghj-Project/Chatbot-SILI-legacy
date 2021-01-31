const path = require('path')

/**
 * @module plugin-common common插件配置
 */
module.exports = ({ koishi }) => {
  koishi.plugin(require('koishi-plugin-common'), {
    // 欢迎信息
    // welcomeMessage({ userId }) {
    //   return '❤群成员增加了，[CQ:at,qq=' + userId + ']欢迎新大佬！'
    // },
    // 复读机
    repeater: {
      // 3次自动复读
      repeat: (repeated, times) => times === 3,
      // 复读大于5次打断
      interrupt: (_, times /*, message*/) => times >= 5,
      interruptText: `[CQ:image,file=file:///${path.resolve(
        './images/no_repeat.jpg'
      )}]`,
    },
  })
}

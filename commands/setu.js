const { setu } = require('../secret/api')

module.exports = ({ koishi }) => {
  koishi
    .command('setu', '好东西，但伤身体，请节制使用。')
    .alias('色图')
    .action(({ session }) => {
      session.send('[CQ:image,file=' + setu() + ']')
    })
}

const { setu } = require('../secret/api')

module.exports = ({ koishi }) => {
  koishi
    .command('setu', '色图')
    .alias('色图')
    .action(({ meta }) => {
      meta.$send('[CQ:image,file=' + setu() + ']')
    })
}

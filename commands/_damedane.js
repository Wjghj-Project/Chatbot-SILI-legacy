module.exports = ({ koishi }) => {
  /**
   * @module command-damedane
   */
  koishi.command('damedane').action(({ meta }) => {
    meta.$send('[CQ:music,type=qq,id=4982770]')
    // meta.$send('[CQ:image,file=https://s1.ax1x.com/2020/08/16/dE6VTe.gif]')
  })
}

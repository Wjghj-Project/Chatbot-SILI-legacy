const { resolve } = require('path')

module.exports.apply = function(ctx) {
  ctx.with(['koishi-plugin-webui'], () => {
    ctx.webui.addEntry(resolve(__dirname, './webui-pages/demo.js'))
  })
}

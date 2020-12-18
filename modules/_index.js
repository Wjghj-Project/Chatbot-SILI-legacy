const path = require('path')
const fs = require('fs')

module.exports = ctx => {
  fs.readdir(path.resolve('./modules'), (err, files) => {
    files.forEach(file => {
      if (/^_/.test(file)) return
      console.log('Load auto module:', file)
      require('./' + file)(ctx)
    })
  })
}

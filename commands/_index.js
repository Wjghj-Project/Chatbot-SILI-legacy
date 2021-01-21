const path = require('path')
const fs = require('fs')

module.exports = ctx => {
  fs.readdir(path.resolve('./commands'), (err, files) => {
    files.forEach(file => {
      if (/^_/.test(file) || !/\.js$/.test(file)) return
      console.log('Load command:', file)
      require('./' + file)(ctx)
    })
  })
}

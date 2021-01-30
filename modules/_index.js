const path = require('path')
const fs = require('fs')

module.exports = ctx => {
  fs.readdir(path.resolve('./modules'), (err, files) => {
    files.forEach(file => {
      if (/^_/.test(file) || !/\.js$/.test(file)) return
      try {
        require('./' + file)(ctx)
        console.log('Load auto module:', file)
      } catch (e) {
        console.warn('Faild to load module:', file)
      }
    })
  })
}

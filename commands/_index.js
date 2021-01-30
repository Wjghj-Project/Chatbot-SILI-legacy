const path = require('path')
const fs = require('fs')

module.exports = ctx => {
  fs.readdir(path.resolve('./commands'), (err, files) => {
    files.forEach(file => {
      if (/^_/.test(file) || !/\.js$/.test(file)) return
      try {
        require('./' + file)(ctx)
        console.log('Load command:', file)
      } catch (e) {
        console.warn('Faild to load command:', file)
      }
    })
  })
}

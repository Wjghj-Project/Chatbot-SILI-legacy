const path = require('path')
const fs = require('fs')
const { Logger } = require('koishi-utils')
const logger = new Logger('INIT')

!(() => {
  fs.readdir(path.resolve('./commands'), (err, files) => {
    files.forEach(file => {
      if (/^_/.test(file) || !/\.js$/.test(file)) return
      try {
        require('./' + file)()
        logger.info('√', 'Loaded command:', file)
      } catch (err) {
        logger.warn('×', 'Faild to load command:', file)
        logger.warn(err)
      }
    })
  })
})()

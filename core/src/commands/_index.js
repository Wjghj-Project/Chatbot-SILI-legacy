const path = require('path')
const fs = require('fs')
const { Logger } = require('koishi-utils')
const logger = new Logger('INIT')

!(() => {
  fs.readdir(path.resolve(__dirname), (err, files) => {
    files.forEach((file) => {
      if (file.startsWith('_') || !file.endsWith('.js')) return
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

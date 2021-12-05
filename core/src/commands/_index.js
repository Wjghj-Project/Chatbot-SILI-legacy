const path = require('path')
const fs = require('fs')
const { Logger } = require('koishi-utils')
const logger = new Logger('INIT')

!(() => {
  fs.readdir(path.resolve(__dirname), (err, files) => {
    const modules = files.filter((i) => !i.startsWith('_') && i.endsWith('.js'))
    modules.forEach((file, index) => {
      const progress = `${index + 1}/${modules.length}`
      try {
        require('./' + file)()
        logger.info('√', progress, 'Loaded command:', file)
      } catch (err) {
        logger.warn('×', progress, 'Faild to load command:', file)
        logger.warn(err)
      }
    })
  })
})()

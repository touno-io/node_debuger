const debuger = require('../index')

const test = async () => {
  logger = debuger('testing')
  logger.start('start message.')
  logger.log('log message.')
  logger.info('info message.')
  logger.error(new Error('error message.'))
  logger.success('success message.')
  process.exit()
}

test()

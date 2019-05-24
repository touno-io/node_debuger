const debuger = require('../index')

const test = async () => {
  logger = await debuger('testing')
  logger.start('start message.')
  logger.log('log message.')
  logger.info('info message.')
  logger.error(new Error('error message.'))
  logger.success('success message.')
}

test()
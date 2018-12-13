const { debuger } = require('../index')

logger = debuger.scope('testing')

const test = async () => {
  await logger.start('start message.')
  await logger.log('log message.')
  await logger.info('info message.')
  await logger.error(new Error('error message.'))
  await logger.success('success message.')

  await debuger.Audit('debuger Audit log message.')
  await debuger.LINE('debuger Line log message.')
  await debuger.Twit('debuger Twitter log message.')
}

test()
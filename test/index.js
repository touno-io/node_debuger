const debuger = require('../index')
const axios = require('axios')

const test = async () => {
  logger = debuger('test')
  logger.start('start message.')
  logger.log('log message.')
  logger.info('info message.')
  logger.error(new Error('error message.'))

  try {
    await axios.get('http://exception-request.com/')
  } catch (ex) {
    logger.error(ex)
  }
  try {
    await axios.post('https://google.co.th/')
  } catch (ex) {
    logger.error(ex)
  }
  logger.wait()

  let i = 0
  let id = setInterval(() => {
    logger.increment(10)
    i++
    if (i === 10) {
      logger.stop()
      logger.success('success message.')
      clearInterval(id)
      process.exit()
    }
  }, 100)
}

test()

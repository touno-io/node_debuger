const logger = require('mocha-logger')

describe('Folder -- helper', () => {
  it('Functional -- debuger', done => {
    const debuger = require('../index')
    debuger.start('start message.')
    debuger.log('logmessage.')
    debuger.info('info message.')
    debuger.error(new Error('error Class.'))
    debuger.success('success message.')
  
    const scope = debuger.scope('UnitTest')
    scope.start('start message with scope.')
    scope.log('log message with scope.')
    scope.info('info message with scope.')
    scope.error(new Error('error Class.'))
    scope.success('success message with scope.')

    done()
  })
  // it('Functional -- raven', done => {
  //   const Raven = require('../helper/raven')
  //   Raven.install({}, 'unit-testing')
  //   Raven.warning('test message')
  //   Raven.error(new Error('Testing Error.'))
  //   Raven.ProcessClosed(process, async () => {})
  //   Raven.Tracking(async () => {
  //     done()
  //   })
  // })
  it('Functional -- time', done => {
    const { Time } = require('../index')
    let elapsed = new Time()
    logger.log(elapsed.seconds())
    logger.log(elapsed.nanoseconds())
    logger.log(elapsed.total())
    done()
  })
  it('Functional -- variable', done => {
    const { DevMode, DebugMode, IsLinux, IsWindows } = require('../index')
    logger.log(`DevMode: ${DevMode}`)
    logger.log(`DebugMode: ${DebugMode}`)
    logger.log(`IsLinux: ${IsLinux}`)
    logger.log(`IsWindows: ${IsWindows}`)
    done()
  })
})

const { expect, assert } = require('chai')

describe('node_debuger', () => {
  const { debuger } = require('../index')
  let scope1

  before(async () => {
    scope1 = debuger.scope('scope2')
  })

  describe('#logger()', () => {
    it('message', async () => {
      await scope1.start('start message.')
      await scope1.log('log message.')
      await scope1.info('info message.')
      await scope1.error(new Error('error message.'))
      await scope1.success('success message.')
    
    })
    it('audit logs', async () => {
      await debuger.Audit('debuger Audit log message.')
      await debuger.LINE('debuger Line log message.')
      await debuger.Twit('debuger Twitter log message.')
    })
  })

  // describe('#helper()', () => {
  //   // it('Functional -- raven', done => {
  //   //   const Raven = require('../helper/raven')
  //   //   Raven.install({}, 'unit-testing')
  //   //   Raven.warning('test message')
  //   //   Raven.error(new Error('Testing Error.'))
  //   //   Raven.ProcessClosed(process, async () => {})
  //   //   Raven.Tracking(async () => {
  //   //     done()
  //   //   })
  //   // })
  //   it('class time.seconds', done => {
  //     let elapsed = new main.Time()
  //     assert(typeof elapsed.seconds, 'function')
  //   })
  //   it('class time.nanoseconds', done => {
  //     let elapsed = new main.Time()
  //     expect(elapsed).to.have.property('nanoseconds')
  //   })
  //   it('class time.total', done => {
  //     let elapsed = new main.Time()
  //     expect(elapsed.seconds).to.have.property('total')
  //   })
  //   it('const DevMode', done => {
  //     expect(main).to.have.property('DevMode')
  //   })
  //   it('const DebugMode', done => {
  //     expect(main).to.have.property('DebugMode')
  //   })
  //   it('const IsLinux', done => {
  //     expect(main).to.have.property('IsLinux')
  //   })
  //   it('const IsWindows', done => {
  //     expect(main).to.have.property('IsWindows')
  //   })
  // })
  

})

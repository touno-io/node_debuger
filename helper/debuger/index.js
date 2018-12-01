const loggerCreate = require('./logger')
const timezone = require('moment-timezone')
const Time = require('./../time')

timezone.tz.setDefault(process.env.TZ || 'Asia/Bangkok')

module.exports = Object.assign(loggerCreate(), {
  scope (name) {
    return loggerCreate(name)
  },
  audit: (message, type = 'audit', tag = []) => async () => {
    let measure = new Time()
    const db = require('./../mongodb')
    let { Audit } = await db.open()
    if (!message || !Audit) return
    let log = new Audit({
      created: new Date(),
      scope: 'audit',
      message,
      type,
      tag
    })
    await log.save()
    let logger = loggerCreate('debuger')
    logger.log(`audit log`, message.length, `characters saved. (${measure.nanoseconds()})`)
  },
  LINE: (message, schedule = new Date(), endpoint = 'Touno') => async () => {
    if (!message || !schedule) return
    let measure = new Time()
    const db = require('./../mongodb')
    let { Notify } = await db.open()
    if (!Notify) return

    let log = new Notify({
      endpoint,
      message,
      notify: false,
      schedule: schedule,
      created: new Date()
    })
    await log.save()
    let logger = loggerCreate('debuger')
    logger.log(`notify message`, message.length, `characters saved. (${measure.nanoseconds()})`)
  }
})

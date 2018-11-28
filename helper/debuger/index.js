const loggerCreate = require('./logger')
const timezone = require('moment-timezone')
const Raven = require('./../raven')
const Time = require('./../time')
const { isDev } = require('./../variable')

timezone.tz.setDefault(process.env.TZ || 'Asia/Bangkok')

module.exports = Object.assign(loggerCreate(), {
  scope (name) {
    return loggerCreate(name)
  },
  audit: (message, timeline, badge, tag) => Raven.Tracking(async () => {
    let measure = new Time()
    const db = require('./../../db-touno')
    if (!db.connected()) throw new Error('MongoDB ConnectionOpen() is not used.')
    let { Audit } = await db.open()
    let log = new Audit({
      created: new Date(),
      message: message,
      timeline: (isDev ? 'test' : timeline) || null,
      badge: badge || null,
      tag: tag || []
    })
    await log.save()
    let logger = loggerCreate('Audit')
    logger.info(`Server audit log`, message.length, `characters saved. (${measure.nanoseconds()})`)
  }),
  LINE: (message, schedule = null) => Raven.Tracking(async () => {
    let measure = new Time()
    const db = require('./../../db-touno')
    if (!db.connected()) throw new Error('MongoDB ConnectionOpen() is not used.')
    let { Notification } = await db.open()
    let log = new Notification({
      endpoint: 'Touno',
      message: message,
      notify: isDev,
      schedule: schedule,
      created: new Date()
    })
    await log.save()
    let con = loggerCreate('Notify')
    con.info(`Server notify message`, message.length, `characters saved. (${measure.nanoseconds()})`)
  })
})

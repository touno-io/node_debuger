const loggerCreate = require('./logger')
const timezone = require('moment-timezone')
const moment = require('moment')
const Time = require('./../time')
const db = require('./../mongodb')

timezone.tz.setDefault(process.env.TZ || 'Asia/Bangkok')

module.exports = Object.assign(loggerCreate(), {
  scope (name) {
    return loggerCreate(name)
  },
  audit: (message, type = 'audit', tag = []) => async () => {
    if (!message) return

    let measure = new Time()
    let logger = loggerCreate('audit')
    let { Audit } = await db.open()
    if (!Audit) return logger.log(message)

    await new Audit({ created: new Date(), scope: 'audit', message: message, type: type, tag: tag }).save()
    await logger.log(`log`, message.length, `characters saved. (${measure.nanoseconds()})`)
  },
  LINE: (message, schedule = new Date(), endpoint = 'Touno') => async () => {
    if (!message) return
    let measure = new Time()
    let logger = loggerCreate('notify')
    let { Notify } = await db.open()
    if (!Notify) return logger.log(moment(schedule).format('DD-MM-YYYY HH:mm:ss'), message)

    await new Notify({ endpoint: endpoint, message: message, notify: false, schedule: schedule, created: new Date() }).save()
    logger.log(`message`, message.length, `characters saved. (${measure.nanoseconds()})`)
  }
})

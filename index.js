const vars = require('./helper/variable')
const Time = require('./helper/time')
const Raven = require('./helper/raven')
const lgCreate = require('./helper/logger')
const timezone = require('moment-timezone')
const db = require('./helper/mongodb')
const moment = require('moment')

timezone.tz.setDefault(process.env.TZ || 'Asia/Bangkok')

if (vars.DevMode) {
  try {
    require.resolve('youch')
    require.resolve('youch-terminal')
  } catch (e) {
    console.log(`Please Install modules youch and youch-terminal. 'npm i --save-dev youch youch-terminal'`)
    process.exit(e.code)
  }
}

module.exports = {
  ...vars,
  Time,
  Raven,
  debuger: Object.assign(lgCreate(), {
    scope (name) {
      return lgCreate(name)
    },
    async dbScope (name) {
      let { Audit } = await db.open()
      return lgCreate(name, Audit)
    },
    async audit (message, type = 'audit', tag = []) {
      if (!message) return

      let measure = new Time()
      let logger = lgCreate('audit')
      let { Audit } = await db.open()
      if (!Audit) return logger.log(message)

      await new Audit({ created: new Date(), scope: 'audit', message: message, type: type, tag: tag }).save()
      await logger.log(`log`, message.length, `characters saved. (${measure.nanoseconds()})`)
    },
    async LINE (message, schedule = new Date(), endpoint = 'Touno') {
      if (!message) return

      let measure = new Time()
      let logger = lgCreate('notify')
      const db = require('./helper/mongodb')
      let { Notify } = await db.open()
      if (!Notify) return logger.log(moment(schedule).format('DD-MM-YYYY HH:mm:ss'), message)

      await new Notify({ endpoint: endpoint, message: message, notify: false, schedule: schedule, created: new Date() }).save()
      logger.log(`message`, message.length, `characters saved. (${measure.nanoseconds()})`)
    }
  })
}

const vars = require('./helper/variable')
const Time = require('./helper/time')
const Raven = require('./helper/raven')
const lgCreate = require('./helper/logger')
const timezone = require('moment-timezone')
const db = require('./mongodb')
// const moment = require('moment')

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
      const logger = lgCreate(name)
      let { Audit } = await db.open()
      return {
        log (...msg) {
          let result = logger.log(...msg)
        }
      }
    },
    audit: (message, type = 'audit', tag = []) => {
      if (!message) return

      lgCreate('audit').log(message)
      // let measure = new Time()
      // let logger = lgCreate('audit')
      // const db = require('./helper/mongodb')
      // let { Audit } = await db.open()
      // if (!Audit) return logger.log(message)

      // await new Audit({ created: new Date(), scope: 'audit', message: message, type: type, tag: tag }).save()
      // await logger.log(`log`, message.length, `characters saved. (${measure.nanoseconds()})`)
    },
    LINE: (message, schedule = new Date(), endpoint = 'Touno') => {
      if (!message) return
      lgCreate('notify').log(message)
      // let measure = new Time()
      // let logger = lgCreate('notify')
      // const db = require('./helper/mongodb')
      // let { Notify } = await db.open()
      // if (!Notify) return logger.log(moment(schedule).format('DD-MM-YYYY HH:mm:ss'), message)

      // await new Notify({ endpoint: endpoint, message: message, notify: false, schedule: schedule, created: new Date() }).save()
      // logger.log(`message`, message.length, `characters saved. (${measure.nanoseconds()})`)
    }
  })
}

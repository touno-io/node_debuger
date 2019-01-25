const vars = require('./helper/variable')
const Time = require('./helper/time')
const Raven = require('./helper/raven')
const loggerCreate = require('./helper/logger')
const timezone = require('moment-timezone')
const { touno } = require('@touno-io/db/mongo')
const moment = require('moment')

const saved = process.env.MONGODB_DEBUGER === 'true'
timezone.tz.setDefault(process.env.TZ || 'Asia/Bangkok')

if (!module.parent) {
  try {
    require.resolve('youch')
    require.resolve('youch-terminal')
  } catch (e) {
    console.log(`Please Install modules youch and youch-terminal. 'npm i --save-dev youch youch-terminal'`)
    process.exit(e.code)
  }
}

const isMongo = !!process.env.MONGODB_SERVER
const sendNotify = async (message, schedule, endpoint, apiName) => {
  if (!message) return

  let getDate = moment(!schedule ? new Date() : schedule)
  let measure = new Time()
  let logger = loggerCreate(apiName)

  if (!isMongo) return logger[vars.DevMode ? 'log' : 'info'](getDate.format('DD-MM-YYYY HH:mm:ss'), message.replace(/\n|\n\r|\r\n/ig, '\\n'))

  let { LogNotify, LogAudit } = await touno.open()
  await new LogNotify({ endpoint: endpoint, message: message, notify: false, schedule: schedule, created: new Date() }).save()

  let msg = `${apiName} ${message.length} characters save and schedule at ${getDate.format('D MMM YYYY HH:mm:ss')}. (${measure.nanoseconds()})`
  await new LogAudit({ created: new Date(), scope: apiName, message: msg, type: 'audit', tag: [ apiName, endpoint ] }).save()
  await logger.log(msg)
}

module.exports = {
  ...vars,
  Time,
  Raven,
  debuger: {
    scope (name) {
      return loggerCreate(name, saved)
    },
    async Audit (message, type = 'audit', tag = []) {
      if (!message) return

      let measure = new Time()
      let logger = loggerCreate('audit')
      if (!isMongo) return logger[vars.DevMode ? 'log' : 'info'](moment().format('DD-MM-YYYY HH:mm:ss'), message.replace(/\n|\n\r|\r\n/ig, '\\n'))

      let { LogAudit } = await touno.open()
      await new LogAudit({ created: new Date(), scope: 'audit', message: message, type: type, tag: tag }).save()
      await logger.log(`log`, message.length, `characters saved. (${measure.nanoseconds()})`)
    },
    async LINE (message, schedule = null, endpoint = 'Touno') {
      return sendNotify(message, schedule, endpoint, 'LINE')
    },
    async Slack (obj, schedule = null) {
      return sendNotify(obj, schedule, 'Slack', 'Slack')
    },
    async Twit (message, schedule = new Date()) {
      return sendNotify(message, schedule, 'twitter', 'Twit')
    }
  }
}

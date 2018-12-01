const Raven = require('raven')
const { DevMode } = require('./variable')
const logger = require('./logger')('Raven')

let config = null
let name = null
let report = {
  warning (ex) {
    Raven.captureMessage(ex instanceof Error ? ex : new Error(ex), { level: 'warning' })
  },
  error (ex) {
    Raven.captureException(ex instanceof Error ? ex : new Error(ex), config)
  }
}

const killProcess = async (proc, OnExitProcess) => {
  logger.log('Got SIGINT.  Press Control-C to exit.')
  if (!(OnExitProcess instanceof Function)) throw new Error('OnExitProcess not Promise.')
  try { await OnExitProcess() } catch (ex) { logger.error(ex) }
  proc.exit()
}

module.exports = {
  warning: report.warning,
  error: report.error,
  async Tracking (OnAsyncCallback, IsExitProcess) {
    if (!config || !name) throw new Error('Raven not set configuration.')
    if (!(OnAsyncCallback instanceof Function)) throw new Error('Tracking not Promise.')
    try {
      await OnAsyncCallback()
    } catch (ex) {
      logger.error(ex)
      if (IsExitProcess) process.exit(0)
    }
  },
  ProcessClosed (proc, OnExitProcess) {
    proc.on('SIGINT', async () => killProcess(proc, OnExitProcess))
    proc.on('SIGTERM', async () => killProcess(proc, OnExitProcess))
  },
  install (data, servernName) {
    config = data
    name = servernName
    if (!DevMode) {
      // RAVEN_CONFIG=https://bf6e4ca97c6f45b29017c7cd0a7626fd@sentry.io/1204359
      if (!process.env.RAVEN_CONFIG) throw new Error('`RAVEN_CONFIG` ')
    }
    Raven.config(!DevMode && process.env.RAVEN_CONFIG).install((err, initialErr) => {
      logger.error(err || initialErr)
      process.exit(1)
    })
  }
}

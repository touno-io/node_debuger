const mongoose = require('mongoose')

module.exports = async () => {
  if (!process.env.MONGODB_DEBUGER_URI) return { connected: () => false }
  let conn = await mongoose.createConnection(process.env.MONGODB_DEBUGER_URI, { useCreateIndex: true, useNewUrlParser: true, connectTimeoutMS: 10000 })

  const logger = require('../debuger').scope('MongoDB')
  logger.log(`Connected. mongodb://[@touno-io/debuger]/log-audit`)
  conn.connected = () => conn.readyState === 1
  conn.close = async () => {
    await conn.close()
    logger.log(`Closed. mongodb://[@touno-io/debuger]/log-audit`)
  }

  conn.Audit = conn.model('db-log-audit', mongoose.Schema({
    type: {
      type: String,
      index: true
    },
    scope: {
      type: String,
      index: true
    },
    message: String,
    tag: Array,
    created: {
      type: Date,
      index: true
    }
  }), 'db-log-audit')

  conn.Notify = conn.model('db-log-notify', mongoose.Schema({
    endpoint: {
      type: String,
      index: true
    },
    message: mongoose.Schema.Types.Mixed,
    notify: {
      type: Boolean,
      index: true
    },
    schedule: {
      type: Date,
      index: true
    },
    created: Date
  }), 'db-log-notify')

  return conn
}

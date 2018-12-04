const mongoose = require('mongoose')

let conn = { connected: () => false, close: () => false }
module.exports = {
  open: async () => {
    if (!process.env.MONGODB_DEBUGER_URI) return conn
    if (!conn.connected()) conn = await mongoose.createConnection(process.env.MONGODB_DEBUGER_URI, { useCreateIndex: true, useNewUrlParser: true, connectTimeoutMS: 10000 })

    conn.connected = () => conn.readyState === 1
    conn.close = async () => {
      console.log('connected close.')
      await conn.close()
    }

    conn.Audit = conn.model('log-audit', mongoose.Schema({
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
    }), 'log-audit')

    conn.Notify = conn.model('log-notify', mongoose.Schema({
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
    }), 'log-notify')

    return conn
  }
}

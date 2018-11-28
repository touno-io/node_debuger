module.exports = () => {
  let conn = await mongoose.createConnection(process.env.MONGODB_URI, { useCreateIndex: true, useNewUrlParser: true, connectTimeoutMS: 10000 })
  
  const debuger = require('../debuger').scope('MongoDB')
  debuger.log(`Connected. mongodb://.../log-audit`)
  conn.connected = () => conn.readyState === 1
  conn.close = async () => {
    await conn.close()
    debuger.log(`Closed. mongodb://.../log-audit`)
  }
  
  conn.audit = conn.model('log-audit', mongoose.Schema({
    message: String,
    active: String,
    badge: String,
    tag: Array,
    created: Date,
  }), 'log-audit')

  conn.logs = conn.model('log-server', mongoose.Schema({
    message: String,
    active: String,
    badge: String,
    tag: Array,
    created: Date,
  }), 'log-server')

  return conn
}
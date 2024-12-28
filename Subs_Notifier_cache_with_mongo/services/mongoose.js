const { mongoose } = require('mongoose')
const { Schema } = mongoose
const options = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
}
async function DBConnect() {
  await mongoose
    .connect(process.env.MONGO_DB_URL, options)
    .then(() => console.log('Database Connected'))
    .catch(error => console.error({ message: 'Database disconnected', error }))
}

async function DBDisconnect() {
  mongoose.disconnect()
    .then(() => console.log('Disconnected from MongoDB.'))
    .catch(err => console.error('Error disconnecting from MongoDB', err))
}
const golden_order_schema = new Schema({
  error: Schema.Types.Mixed,
  order_reference: { type: String, required: false, index: true },
  flow: { type: String, required: true, default: 'Store' },
  event: { type: String, required: true },
  customer: Schema.Types.Mixed,
  order: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const endpoint_data = new Schema({
  baseUrl: { type: String, required: true },
  options: Schema.Types.Mixed,
  method: { type: String, required: true, default: 'post' }
})
const subscription_schema = new Schema({
  event: { type: String, required: false },
  flow: { type: String, required: true, default: 'Store' },
  active: { type: Boolean, required: true, default: true },
  endpoint_data,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const GoldenOrder = mongoose.model('golden_order', golden_order_schema)
const Subscriptions = mongoose.model('subscription', subscription_schema)
module.exports = { DBConnect, DBDisconnect, GoldenOrder, Subscriptions }
/*
subscription example
{
  "_id":{"$oid":"667deb4b4f9a4cf24d245754"},
  "event":"ORDER_CREATED",
  "flow":"Store",
  "active":true,
  "endpoint_data":{
    "method": "get",
    "baseUrl":"ttps://www.hola.com/test",
    "options":{}
  }
}
*/

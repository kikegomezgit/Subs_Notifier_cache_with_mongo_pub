const NodeCache = require('node-cache')
const Subscriptions = new NodeCache()
const _Subscriptions = new NodeCache()
const { Subscriptions: Subscriptions_db } = require('./mongoose.js')
const { retryFunction } = require('./promise-retry.js')

const _serializeKey = (flow, event) => {
  return `${flow}-${event}`
}

const setOnMap = (cache, flow, event, value) => {
  const key = _serializeKey(flow, event)
  // Check if the key already exists
  if (cache.has(key)) {
    // If the key exists, append the new value to the existing array
    const currentValue = cache.get(key)
    currentValue.push(value) // Append the new value
    cache.set(key, currentValue)// Update the map
  } else {
    // If the key does not exist, create a new array with the value
    cache.set(key, [value])
  }
}

const getOnMap = (flow, event) => {
  const key = _serializeKey(flow, event)
  const result = _Subscriptions.get(key) || Subscriptions.get(key)
  return result
}

const hasOnMap = (flow, event) => {
  const key = _serializeKey(flow, event)
  return _Subscriptions.has(key)
}

const flushAllData = _ => {
  Subscriptions.flushAll()
}

const refreshData = async (rows) => {
  // secondary cache
  refreshOnCache(Subscriptions, rows)
  await new Promise(resolve => setTimeout(resolve, 1000))
  // main cache
  refreshOnCache(_Subscriptions, rows)
}

const refreshSubscriptions = async _ => {
  const rows = await retryFunction(Subscriptions_db.find({ active: true }), {
    attempts: 99,
    minTimeout: 9_000,
    maxTimeout: 13_000,
    additionalDataOnCatch: {
      functionCalled: 'subs/get-all-subscriptions',
      message: '[Failed]'
    }
  })
  if (rows) {
    refreshData(rows)
  }
}

const refreshOnCache = (cache, rows) => {
  cache.flushAll()
  rows.map(row => {
    const { event, flow, endpoint_data } = row
    return setOnMap(cache, flow, event, endpoint_data)
  })
}

module.exports = {
  setOnMap,
  getOnMap,
  hasOnMap,
  flushAllData,
  refreshSubscriptions
}

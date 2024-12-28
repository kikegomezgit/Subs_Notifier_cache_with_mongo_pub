const { GoldenOrder } = require('./services/mongoose')
// const { insertValidation } = require('../../helpers')
const { getOnMap, expressUrlCaller } = require('../../services')

const createOrderVersion = async ({ body }) => {
  try {
    const { golden_order } = body

    const {
      event,
      flow
    } = golden_order

    // validate on cache or db if event is valid
    const valid_events = ['ORDER_CREATED', 'ORDER_MODIFIED', 'ORDER_CANCELED']
    if (!valid_events.includes(event)) {
      return
    }
    // persist
    new GoldenOrder(golden_order).save()
    // Subscription obtained from node-cache dictated by the current params
    const rows = getOnMap(flow, event) || []

    if (rows) {
      const promises = []
      rows.map(subscription => promises.push(() => {
        // custom actions on options
        if (subscription?.options?.keep_error === false) {
          golden_order.errors = []
        }
        return Promise.resolve(expressUrlCaller({
          baseURL: subscription.baseUrl,
          method: subscription.method || 'post',
          body: golden_order
        }))
      }))
      for (const promise of promises) {
        await promise()
      }
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  createOrderVersion
}

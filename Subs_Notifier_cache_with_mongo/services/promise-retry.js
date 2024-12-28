const promiseRetry = require('promise-retry')

// example of usage
//  retryFunction(functionToBeCalled{ body }), { attempts: 3 })
const retryFunction = async (functionToBeCalled, options) => {
  const config = {
    retries: options.attempts || 1, // number of total trys
    minTimeout: options.minTimeout || 7_000, // minimum interval
    maxTimeout: options.maxTimeout || 8_000, // maximum interval
    specialConditionOnThenToRetry: options.specialConditionOnThenToRetry || null, // special condition on response
    additionalDataOnCatch: options.additionalDataOnCatch || {}// additional data to attach on error throw
  }
  // substract required options
  const { specialConditionOnThenToRetry, additionalDataOnCatch, ...optionsConfig } = config
  return promiseRetry((retry, number) => (
    functionToBeCalled
      .then(response => {
        if (!response) retry()
        if (options.specialConditionOnThenToRetry) {
          retry()
        }
        return response
      })
      .catch((err) => {
        if (number <= config.retries - 1) retry()
        err = { ...err, numberOfRetries: number }
        throw err
      })
  ),
    optionsConfig)
}

module.exports = {
  retryFunction
}

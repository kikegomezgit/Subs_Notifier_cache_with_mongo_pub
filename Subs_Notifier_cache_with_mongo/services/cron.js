const cron = require('node-cron')

const refreshSubscriptionsScheduler = (subsFunction) => {
  if (process.env.NODE_ENV === 'development'.toLowerCase()) {
    // Runs every midnight at dev time
    cron.schedule('0 6 * * *', () => {
      subsFunction()
    })
  }

  if (process.env.NODE_ENV === 'production'.toLowerCase()) {
    // Runs every midnight at prod time
    cron.schedule('0 6 * * *', () => {
      subsFunction()
    })
  }
}

module.exports = {
  cron,
  refreshSubscriptionsScheduler
}

const insertValidation = body => {
  if (Array.isArray(body)) {
    const allObjects = body.every(item => typeof item === 'object' && item !== null)
    if (allObjects) {
      return 'insertMany'
    }
  } else if (typeof body === 'object' && body !== null) {
    if (Object.keys(body).length > 2) {
      return 'insertOne'
    }
  }
  return null
}

module.exports = {
  insertValidation
}

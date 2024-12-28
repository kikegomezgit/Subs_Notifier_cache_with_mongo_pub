const axios = require('axios')
const REQUEST_TIMEOUT = 20000

const expressUrlCaller = async ({ baseURL = '', uri = '', method = 'post', body = {} }) => {
    try {
        const request = axios.create({
            baseURL,
            timeout: REQUEST_TIMEOUT
        })
        return await request[method](uri, body)
    } catch (error) {
        errorParser({ request: 'express-url-caller', body, uri: `${method} ${baseURL}` + uri }, error)
    }
}

const errorParser = (data = {}, error) => {
    const { response, config, stack, message, code, numberOfRetries } = error
    let _error = {
        code,
        request: data?.request,
        request_uri: data?.uri,
        request_payload: data?.body,
        ...(message && error instanceof Error && { message }),
        ...(stack && error instanceof Error && { stack }),
        ...(config?.baseURL && error instanceof Error && { baseURL: config?.url ? config?.baseURL + config?.url : config?.baseURL }),
        ...(numberOfRetries && { numberOfRetries })
    }
    if (response?.data && axios.isAxiosError(error)) {
        const { data: r_data, status } = response
        _error = {
            ..._error,
            data: r_data,
            ...(status && { status })
        }
    }
    throw _error
}

module.exports = {
    expressUrlCaller
}

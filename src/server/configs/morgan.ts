import morgan from 'morgan'

import logger from './logger'

morgan.token('message', (req, res) => {
  return `${res.statusMessage || ''} - Request-URL: ${req.url}`
})

const getIpFormat = () => 'address - '
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`

const successHandler = morgan(successResponseFormat, {
  skip: (_req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
})

const errorHandler = morgan(errorResponseFormat, {
  skip: (_req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
})

export default {
  successHandler,
  errorHandler,
}

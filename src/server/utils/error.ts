import { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.log(err)

  const status = err.status || 500
  const message = err.message || 'Something went wrong'

  res.status(status).json({
    status,
    message,
    success: false,
  })
}

export default errorHandler

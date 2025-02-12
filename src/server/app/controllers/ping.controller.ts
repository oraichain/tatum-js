import httpStatus from 'http-status'

import tryCatchAsync from '../../utils/tryCatchAsync'

const ping = tryCatchAsync(async (_req, res, _next) => {
  res.status(httpStatus.OK).json({
    message: 'Ping to server successfully!',
    data: {},
    success: true,
  })
})

export default { ping }

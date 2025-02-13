import httpStatus from 'http-status'

import tryCatchAsync from '../../utils/tryCatchAsync'
import swapContractService from '../services/swapContract.service'

const swap = tryCatchAsync(async (req, res, _next) => {
  const { sender, typeUrl, value } = req.body

  const data = await swapContractService.swap(sender, typeUrl, value)
  res.status(httpStatus.OK).json({
    message: 'Parse swap successfully!',
    data: data,
    success: true,
  })
})

export default { swap }

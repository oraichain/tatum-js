import httpStatus from 'http-status'

import { MSG_TYPE } from '../../constant/msgType'
import tryCatchAsync from '../../utils/tryCatchAsync'
import parserService from '../services/parser.service'

const parser = tryCatchAsync(async (req, res, _next) => {
  const { typeUrl, value, sender } = req.body

  const typeMsg = String(typeUrl).split('.')
  let data: any

  switch (typeMsg[0].split('/')[1]) {
    case MSG_TYPE.COSMOS_MSG:
      // TODO: need to handle
      break
    case MSG_TYPE.COSMWASM_MSG:
      data = parserService.parseCosmwasm({ sender, typeUrl, value }, typeMsg[3])
      break
    default:
      break
  }

  res.status(httpStatus.OK).json({
    message: 'Parse message successfully!',
    data: data,
    success: true,
  })
})

export default { parser }

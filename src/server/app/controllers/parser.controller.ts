import httpStatus from 'http-status'

import { MSG_TYPE } from '../../constant/msgType'
import { ParserBody } from '../../types/parser'
import tryCatchAsync from '../../utils/tryCatchAsync'
import parserService from '../services/parser.service'

const parser = tryCatchAsync(async (req, res, _next) => {
  const { messages, sender } = req.body as ParserBody
  const [firstMsg] = messages

  const typeMsg = String(firstMsg.typeUrl).split('.')
  let data: any

  switch (typeMsg[0].split('/')[1]) {
    case MSG_TYPE.COSMOS_MSG:
      data = await parserService.parseCosmos({ sender, messages }, typeMsg[1], typeMsg[3])
      break
    case MSG_TYPE.COSMWASM_MSG:
      data = await parserService.parseCosmwasm({ sender, messages }, typeMsg[3])
      break
    case MSG_TYPE.IBC_MSG:
      data = await parserService.parseIbc({ sender, messages }, typeMsg[4])
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

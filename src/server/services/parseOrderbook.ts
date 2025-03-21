import httpStatus from 'http-status'

import { ParseInput } from '../types/parser'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'
import { ORDERBOOK_EXECUTE_TYPE } from '../constant/msgType'

export const parseOrderbookContract = async ({ sender, messages, action }: ParseInput) => {
    let response
    const msgs = []

    for (const msg of messages) {
        msgs.push({
            typeUrl: msg.typeUrl,
            value: Uint8Array.from(Buffer.from(msg.value, 'base64')),
        })
    }

    const simRes = await oraichainTatum.simulate.simulate(sender, msgs)
    if (simRes.error) {
        throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, simRes.error.message as any)
    }

    if (!simRes.data.result) {
        throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, 'Simulate with undefined result')
    }

    switch (action) {
        case ORDERBOOK_EXECUTE_TYPE.SUBMIT_ORDER:
        case ORDERBOOK_EXECUTE_TYPE.SUBMIT_MARKET_ORDER:
            response = await oraichainTatum.orderbook.parseOpenOrderbook({
                message: msgs,
                events: simRes.data.result!.events
            })
            break
        default:
            break
    }

    return {
        action: {
            action: 'orderbook',
            msgAction: action,
        },
        response,
    }
}
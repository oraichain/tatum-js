import { Event } from '@cosmjs/stargate'
import Container, { Service } from 'typedi'

import { TatumConnector } from '../../connector'
import { CONFIG, ResponseDto, Status } from '../../util'
import { CommonInfoCosmos } from '../common-info'
import { TatumConfig } from '../tatum'
import { OrderbookCosmosData, OrderbookResponse } from './orderbook.dto'

@Service({
	factory: (data: { id: string }) => new OrderbookCosmos(data.id),
	transient: true,
})
export class OrderbookCosmos {
	private readonly connector: TatumConnector
	private readonly config: TatumConfig
	private commonInfo: CommonInfoCosmos

	constructor(private readonly id: string) {
		this.connector = Container.of(this.id).get(TatumConnector)
		this.config = Container.of(this.id).get(CONFIG)
		this.commonInfo = Container.of(this.id).get(CommonInfoCosmos)
	}

	/**
	 * Parse Orderbook msg
	 */
	async parseOrderbook(data: OrderbookCosmosData): Promise<ResponseDto<OrderbookResponse | null>> {
		let returnData: OrderbookResponse = {} as any
		let error = null
		let status = Status.SUCCESS

		try {
			const wasmEvents: Event[] = []

			for (const event of data.events) {
				if (event.type === 'wasm') {
					wasmEvents.push(event)
				}
			}

			const orderbookEvent = wasmEvents.find((event) => {
				for (const attribute of event.attributes) {
					if (
						attribute.key === '_contract_address' &&
						attribute.value === 'orai1nt58gcu4e63v7k55phnr3gaym9tvk3q4apqzqccjuwppgjuyjy6sxk8yzp'
					) {
						return event
					}
				}

				return undefined
			})

			if (!orderbookEvent) {
				throw new Error('Orderbook event not found')
			}

			let askAmount: string = ''
			let offerAmount: string = ''
			let askTokenId: string = ''
			let offerTokenId: string = ''
			const tokenIds: string[] = []

			for (const attribute of orderbookEvent.attributes) {
				switch (attribute.key) {
					case 'ask_asset':
						askAmount = attribute.value.split(' ')[0]
						askTokenId = attribute.value.split(' ')[1]
						break
					case 'offer_asset':
						offerAmount = attribute.value.split(' ')[0]
						offerTokenId = attribute.value.split(' ')[1]
						break
					case 'bidder_addr':
						returnData.bidderAddress = attribute.value
						break
					case 'order_type':
						returnData.orderType = attribute.value
						break
					case 'direction':
						returnData.orderDirection = attribute.value
						break
				}
			}

			if (askTokenId !== "") {
				tokenIds.push(askTokenId)
			}
			if (offerTokenId !== "") {
				tokenIds.push(offerTokenId)
			}
			const tokenInfos = (await this.commonInfo.getTokenInfos({ tokenIds })).data

			returnData.askAssetInfo = tokenIds.length === 2 ? {
				amount: askAmount,
				name: tokenInfos[0].name,
				denom: tokenInfos[0].denom,
				decimal: tokenInfos[0].decimal,
				icon: tokenInfos[0].icon,
				coinGeckoId: tokenInfos[0].coinGeckoId,
			} : null

			returnData.offerAssetInfo = {
				amount: offerAmount,
				name: tokenInfos[tokenIds.length - 1].name,
				denom: tokenInfos[tokenIds.length - 1].denom,
				decimal: tokenInfos[tokenIds.length - 1].decimal,
				icon: tokenInfos[tokenIds.length - 1].icon,
				coinGeckoId: tokenInfos[tokenIds.length - 1].coinGeckoId,
			}
		} catch (err: any) {
			error = err
			status = Status.ERROR
		}

		return {
			data: Object.keys(returnData).length === 0 ? null : returnData,
			error,
			status,
		}
	}
}

@Service({
	factory: (data: { id: string }) => new OrderbookEvm(data.id),
	transient: true,
})
export class OrderbookEvm {
	private readonly connector: TatumConnector
	private readonly config: TatumConfig
	private commonInfo: CommonInfoCosmos

	constructor(private readonly id: string) {
		this.connector = Container.of(this.id).get(TatumConnector)
		this.config = Container.of(this.id).get(CONFIG)
		this.commonInfo = Container.of(this.id).get(CommonInfoCosmos)
	}
}

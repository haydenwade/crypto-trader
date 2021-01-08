const Exchange = require('./exchange');
const axios = require('axios').default;
const config = require('../config');
const crypto = require('crypto');
const qs = require('qs');

const createSignature = (data) => {
    return crypto.createHmac('sha256', config.binanceUs.credentials.secretKey).update(data).digest('hex');
}

//Docs: https://github.com/binance-us/binance-official-api-docs
class BinanceUs extends Exchange {
    constructor() {
        super();
    }
    async getAvailbleFunds() {
        const data = {
            timestamp: Date.now()
        };
        const dataAsQs = qs.stringify(data);
        const request = {
            method: 'get',
            url: `${config.binanceUs.apiEndpoint}/api/v3/account?${dataAsQs}&signature=${createSignature(dataAsQs)}`,
            headers: {
                'X-MBX-APIKEY': config.binanceUs.credentials.apiKey
            }
        };
        const resp = await axios(request);
        return resp.data;
    };
    async _order(ticker, limitPrice, quantity, side) {
        const data = {
            symbol: ticker,
            side: side,
            type: 'LIMIT',
            timeInForce: 'GTC',
            quantity,
            price: limitPrice,
            timestamp: Date.now()
        };
        const dataAsQs = qs.stringify(data);
        const request = {
            method: 'post',
            url: `${config.binanceUs.apiEndpoint}/api/v3/order?${dataAsQs}&signature=${createSignature(dataAsQs)}`,
            headers: {
                'X-MBX-APIKEY': config.binanceUs.credentials.apiKey
            }
        };
        const resp = await axios(request);
        return resp.data
    }
    async limitBuyOrder(ticker, limitPrice, quantity) {
        return await this._order(ticker, limitPrice, quantity, 'BUY');
    };

    async limitSellOrder(ticker, limitPrice, quantity) {
        return await this._order(ticker, limitPrice, quantity, 'SELL');
    };

    /*
    Use the response from limitSellOrder or limitBuyOrder to check order status
    order = {
        symbol: 'LTCUSD',
        orderId: 1
    }
    */
    async checkOrderStatus(order) {
        const data = {
            symbol: order.symbol,
            orderId: order.orderId,
            timestamp: Date.now()
        };
        const dataAsQs = qs.stringify(data);
        const request = {
            method: 'get',
            url: `${config.binanceUs.apiEndpoint}/api/v3/order?${dataAsQs}&signature=${createSignature(dataAsQs)}`,
            headers: {
                'X-MBX-APIKEY': config.binanceUs.credentials.apiKey
            }
        };
        const resp = await axios(request);
        return resp.data
    };

    //example ticker: 'LTCUSD'
    async getMarketPrice(ticker) {
        const request = {
            method: 'get',
            url: `${config.binanceUs.apiEndpoint}/api/v3/ticker/price?symbol=${ticker}`
        };
        const resp = await axios(request);
        return resp.data;
    };
}
module.exports = BinanceUs

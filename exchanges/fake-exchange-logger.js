//This class is used to paper trade to test the algorithm and codeconst Exchange = require('./exchange');
const Exchange = require('./exchange');
const BinanceUs = require('./binance-us');
const exchange = new BinanceUs();

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: './trades.csv',
    header: [
        {id: 'asset', title: 'Asset'},
        {id: 'orderType', title: 'Buy/Sell'},
        {id: 'orderDateTime', title: 'DateTime'},
        {id: 'price', title: 'Price'},
        {id: 'quantity', title: 'Quantity'}
    ]
});

let availableBalance = 0.25;
class FakeExchangeLogger extends Exchange {
    constructor() {
        super();
    }
    async getAvailbleFunds() {
        return {
            balances:[
                {
                    asset: 'USD',
                    free: availableBalance
                }
            ]
        }
    };
    async limitBuyOrder(ticker, limitPrice, quantity) {
        const order = {
            asset: ticker,
            orderType: 'BUY',
            orderDateTime: Date.now(),
            price: limitPrice,
            quantity: quantity,
            ticker: ticker
        };
        const records = [
            order
        ];
        availableBalance -= quantity;
        await csvWriter.writeRecords(records);
        return order;
    };

    async limitSellOrder(ticker, limitPrice, quantity) {
        const order = {
            asset: ticker,
            orderType: 'SELL',
            orderDateTime: Date.now(),
            price: limitPrice,
            quantity: quantity,
            ticker: ticker
        };
        const records = [
         order
        ];
        availableBalance += quantity;
        await csvWriter.writeRecords(records);
        return order;
    };

    async checkOrderStatus(order) {
        let orderStatus = {
            status: 'PENDING'
        };
        const {price} = await exchange.getMarketPrice(order.ticker+'USD');
        if(parseFloat(price) <= order.price){
            orderStatus.status = 'FILLED';
        }

        return orderStatus;
    };
}
module.exports = FakeExchangeLogger

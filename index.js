require('dotenv').config();
const BinanceUs = require('./exchanges/binance-us');
const FakeExchange = require('./exchanges/fake-exchange-logger');
const exchange = new BinanceUs();
const fakeExchange = new FakeExchange();
//#region helpers
const delay = (ms) => {
    return new Promise((res) => {
        setTimeout(res, ms);
    })
}

const waitForOrderToExecute = async (tradeConfig, order) => {
    let orderStatus = await fakeExchange.checkOrderStatus(order);
    console.log('start waiting for order to execute...');
    while (orderStatus.status !== 'FILLED') {
        console.log('waiting for order to execute...');
        await delay(tradeConfig.delayDurationMs);
        orderStatus = await fakeExchange.checkOrderStatus(order);
    }
    console.log('done waiting for order to execute.');
};
const hasSufficientFunds = (balances, baseCurrency, quantity) => {
    for (let i = 0; i < balances.length; i++) {
        if (balances[i].asset === baseCurrency) {
            return balances[i].free >= quantity
        }
    }
    return false;
}
//#endregion
let trades = new Map();
const main = async (tradeConfig) => {
    try {
        const trade = trades.get(tradeConfig.id);
        if (trade && trade.running) {
            //only 1 should run at a time to prevent insufficient funds
            console.log(`trade: ${tradeConfig.id} already running`);
            return;
        }
        console.log(`trade: ${tradeConfig.id} running`);
        trades.set(tradeConfig.id,{running:true});

        const funds = await fakeExchange.getAvailbleFunds();

        if (hasSufficientFunds(funds.balances, tradeConfig.baseCurrency, tradeConfig.quantity)) {
            // out of market - we have funds so lets buy some assets and open limit orders to sell at X percent above limit
            const marketPrice = await exchange.getMarketPrice(tradeConfig.assetBasePair);
            let limitPrice = parseFloat(marketPrice.price) * (1 - tradeConfig.percentUnderMarketValueToBuyAt)
            const buyOrder = await fakeExchange.limitBuyOrder(tradeConfig.asset, limitPrice, tradeConfig.quantity);
            await waitForOrderToExecute(tradeConfig, buyOrder);
            limitPrice = parseFloat(marketPrice.price) * (1 + tradeConfig.percentAboveBuyPriceToSellAt);
            await fakeExchange.limitSellOrder(tradeConfig.asset, limitPrice, tradeConfig.quantity);
        } else {
            // in market - we don't have any funds and are currently holding waiting for our limit sell orders to be executed, we will wait M amount of time and check back
            console.log(`trade: ${tradeConfig.id} holding or no funds...`);
        }
        console.log(`trade: ${tradeConfig.id} completed`);
        trades.set(tradeConfig.id,{running:false});
    } catch (err) {
        console.log(err);
    }
}

// const ltcTradeConfig = {
//     id: 1,
//     delayDurationMs: 1000 * 60 * 15, // 15 min
//     asset: 'LTC',
//     baseCurrency: 'USD',
//     assetBasePair: 'LTCUSD',
//     quantity: 25, //quantity of asset aka number of coins
//     percentAboveBuyPriceToSellAt: 0.05, //if buy price is $100/coin then a limit order to sell will be for $105/coin
//     percentUnderMarketValueToBuyAt: 0.02, //if market price is $100/coin then a limit order to buy at will be for $98/coin
// };
// main(ltcTradeConfig);
// setInterval(()=>main(ltcTradeConfig), ltcTradeConfig.delayDurationMs);

// const ethTradeConfig = {
//     id: 2,
//     delayDurationMs: 1000 * 60 * 15, // 15 min
//     asset: 'ETH',
//     baseCurrency: 'USD',
//     assetBasePair: 'ETHUSD',
//     quantity: 25, //quantity of asset aka number of coins
//     percentAboveBuyPriceToSellAt: 0.05, //if buy price is $100/coin then a limit order to sell will be for $105/coin
//     percentUnderMarketValueToBuyAt: 0.02, //if market price is $100/coin then a limit order to buy at will be for $98/coin
// };
// main(ethTradeConfig);
// setInterval(()=>main(ethTradeConfig), ethTradeConfig.delayDurationMs);


const btcTradeConfig = {
    id: 2,
    delayDurationMs: 1000 * 30, // 30 seconds
    asset: 'BTC',
    baseCurrency: 'USD',
    assetBasePair: 'BTCUSD',
    quantity: 0.05,
    percentAboveBuyPriceToSellAt: 0.005,
    percentUnderMarketValueToBuyAt: 0.005,
};
main(btcTradeConfig);
setInterval(()=>main(btcTradeConfig), btcTradeConfig.delayDurationMs);

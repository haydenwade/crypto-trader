# crypto-trader
Automated trading of digital assets. Based on Hayden Wade's "5% Strategy". Happy Trading!

## Supported Exchanges
- Binance.US

## Setup
- `npm install`
- Create `./.env` based on the `./.example.env` file. Keys can be generate under account settings for each exchange.
- Configure your trades in `index.js`, can have 1 to many of the below code blocks. **All trade configs must have unique id**

```
//example trading config
const ltcTradeConfig = {
    id: 1,
    delayDurationMs: 1000 * 60 * 15, // 15 min
    asset: 'LTC',
    baseCurrency: 'USD',
    assetBasePair: 'LTCUSD',
    quantity: 25, //quantity of asset aka number of coins
    percentAboveBuyPriceToSellAt: 0.05, //if buy price is $100/coin then a limit order to sell will be for $105/coin
    percentUnderMarketValueToBuyAt: 0.02, //if market price is $100/coin then a limit order to buy at will be for $98/coin
};
main(ltcTradeConfig);
setInterval(()=>main(ltcTradeConfig), ltcTradeConfig.delayDurationMs);
```

## Run
- `npm run start`
- Or debug with VS Code F5



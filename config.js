const config = {
    binanceUs: {
        apiEndpoint: 'https://api.binance.us',
        credentials: {
            apiKey: process.env.BINANCE_US_API_KEY,
            secretKey: process.env.BINANCE_US_SECRET_KEY
        }
    }
}
module.exports = config;

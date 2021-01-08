class Exchange {
    constructor() {
    }
    async getAvailbleFunds() {
        throw new Error('Must be implemented!');
    };

    async limitBuyOrder(ticker, limitPrice, quantity) {
        throw new Error('Must be implemented!');
    };

    async limitSellOrder(ticker, limitPrice, quantity) {
        throw new Error('Must be implemented!');
    };

    async checkOrderStatus(order) {
        throw new Error('Must be implemented!');
    };

    async getMarketPrice(ticker){
        throw new Error('Must be implemented!');
    }
}
module.exports = Exchange

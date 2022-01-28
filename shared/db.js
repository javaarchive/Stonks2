const { Deta } = require('deta');

const deta = Deta(process.env.DETA_PROJECT);

module.exports = {
    stocks: deta.Base('stocks'),
    users: deta.Base('users'),
    state: deta.Base("state"),
    stock_ownerships: deta.Base("stock_ownerships")
};
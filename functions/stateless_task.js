const db = require("../shared/db");
const config = require("../shared/config");

const yahooFinance = require('yahoo-finance2').default;

let skipCheck = false;

exports.handler = async function (event, context) {
    try{
        let lastState = (await db.state.get("task_state")) || {};
        let index = 0;
        if(lastState.lastStock){
            index = (config.tickers.indexOf(lastState.lastStock) + 1);
        }
        if(lastState.lastFetch > 0 && !skipCheck){
            if((Date.now() - lastState.lastFetch) < config.fetchIntervalLimit){
                return {
                    statusCode: 200,
                    body: JSON.stringify({ ok: true }),
                    message: "Fetch interval limit reached"
                };
            }
        }
        index = index % config.tickers.length; // Cycle if needed. 

        // Fetch data

        let tickerToFetch = config.tickers[index];

        let data = await yahooFinance.quote(tickerToFetch);

        await db.stocks.put({
            key: tickerToFetch,
            price: data.regularMarketPrice,
            date: Date.now(),
            currency: data.currency,
            name: data.displayName,
            shortName: data.shortName,
            symbol: data.symbol,
            exchange: data.exchange,
            longName: data.longName,
            quoteSource: data.quoteSourceName,
            market: data.market
        });

        console.log(tickerToFetch,data);

        await db.state.put({
            key: "task_state",
            lastStock: tickerToFetch,
            lastFetch: Date.now()
        });

    }catch(ex){
        return {
            statusCode: 500,
            body: JSON.stringify({ ok: false })
        };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
}

// Allow running directly
if(require.main === module){
    skipCheck = true;
    exports.handler({},{}).then(result => {
        console.log("Simulated Response",result);
    });
}
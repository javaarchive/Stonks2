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
            console.log("We last updated",lastState.lastStock, " so now we are going to update ",index, " which is ", config.tickers[index % config.tickers.length]);
        }
        skipCheck = ("bypass" in lastState && lastState["bypass"] == true);
        if(lastState.lastFetch > 0 && !skipCheck){
            if((Date.now() - lastState.lastFetch) < config.fetchIntervalLimit){
                return {
                    statusCode: 200,
                    body: JSON.stringify({ ok: true, message: "reached fetch interval limit sorry" }),
                    message: "Fetch interval limit reached"
                };
            }
        }
        
        index = index % config.tickers.length; // Cycle if needed. 
        console.log("Index",index, " of ",config.tickers.length, " total stocks");
        
        // Fetch data

        let tickerToFetch = config.tickers[index];

        console.log("Update Task:",tickerToFetch);

        let oldData = await db.stocks.get(tickerToFetch);

        let changeFromLastTime = 0;
        if(oldData && oldData.change) changeFromLastTime = oldData.change;

        let data = await yahooFinance.quote(tickerToFetch);
        let skipPut = false;

        if(oldData){
            if((data.regularMarketPrice - oldData.price) != 0){
                changeFromLastTime = (data.regularMarketPrice - oldData.price); // if something changed indicate it
            }else{
                // eh we're not intrested
                skipPut = true;
            }
        }
        if(!skipPut){
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
                market: data.market,
                change: changeFromLastTime
            });
        }

        console.log(tickerToFetch,data);

        await db.state.put({
            key: "task_state",
            lastStock: tickerToFetch,
            lastFetch: Date.now(),
            bypass: skipCheck ? true: false
        });

    }catch(ex){
        console.warn(ex);
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

const db = require("../shared/db");
const config = require("../shared/config");

exports.handler = async function (event, context) {
    try{
        let lastState = (await db.state.get("task_state")) || {};
        let index = 0;
        if(lastState.lastStock){
            index = (config.tickers.indexOf(lastState.lastStock) + 1);
        }
        index = index % config.tickers.length; // Cycle if needed. 

        // Fetch data

        // simulation

        await db.state.put({
            key: "task_state",
            lastStock: config.tickers[index]
        })
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
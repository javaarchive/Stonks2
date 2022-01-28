const db = require("../shared/db");

exports.handler = async function (event, context) {
    return {
      statusCode: 200,
      body: JSON.stringify(await db.stocks.fetch()),
      headers:{
        "cache-control": "public, max-age=60",
        "age": "10"
      }
    };
  }
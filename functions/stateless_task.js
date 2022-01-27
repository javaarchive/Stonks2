const db = require("../shared/db");
const config = require("../shared/config");

exports.handler = async function (event, context) {
    try{

    }catch(ex){
        return {
            statusCode: 500,
            body: JSON.stringify({ ok: false }),
        };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  }
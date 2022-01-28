const db = require("../shared/db");

exports.handler = async function (event, context) {
  let items = (await db.users.fetch())["items"];

  let filteredItems = items.map(user => {
    delete user.email;
    delete user.key;
  });

  return {
      statusCode: 200,
      body: JSON.stringify(filteredItems),
      headers:{
        "cache-control": "public, max-age=60",
        "age": "10"
      }
    };
  }
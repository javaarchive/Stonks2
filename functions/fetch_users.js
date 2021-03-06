const db = require("../shared/db");
const users = require("../shared/users");

exports.handler = async function (event, context) {
  let user = users.processContext(context);
  if(!user){
      return {
          statusCode: 403,
          body: "You need to be logged in to access data of other users. "
      }
  }

  user = await users.userify(context);

  let items = (await db.users.fetch())["items"];

  let filteredItems = Array.from(items.map(user => {
    delete user.email;
    delete user.key;
    delete user.from;
    return user;
  })).sort((a, b) => (a.money > b.money ? -1 : 1));

  return {
      statusCode: 200,
      body: JSON.stringify(filteredItems),
      headers:{
       // "cache-control": "public, max-age=60",
       // "age": "10"
      }
    };
  }
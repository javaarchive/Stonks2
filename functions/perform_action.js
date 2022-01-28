const users = require("../shared/users");
const db = require("../shared/db");
const config = require("../shared/config");

exports.handler = async function (event, context) {
    let user = users.processContext(context);

    if(!user){
        return {
            statusCode: 403,
            body: "You need to be logged in to purchase or sell stocks."
        }
    }

    if(event["isBase64Encoded"]){
        return {
            statusCode: 403,
            body: "Please do not drop binary data at us."
        }
    }

    if(event["httpMethod"] != "POST" && event["httpMethod"] != "PUT" && event["httpMethod"] != "DELETE"){
        return {
            statusCode: 400,
            body: "You need to POST, PUT, or DELETE to this endpoint. GET is not accepted. "
        }
    }

    user = await users.userify(context);
    
    let body = JSON.parse(event["body"]);

    if(!body.ticker || !body.quantity || !body.action){
        return {
            statusCode: 400,
            body: "Missing field. "
        }
    }

    if(config.tickers.indexOf(body.ticker) == -1){
        return {
            statusCode: 400,
            body: "Not a valid ticker. "
        }
    }

    let stock = await db.stocks.get(body.ticker);
    
    let change = stock.price * body.quantity;

    if(body.action == "buy"){
        if(user.balance < change){
            return {
                statusCode: 400,
                body: "You do not have enough money to buy this stock. Need " + change + " but only have " + user.balance + " :( "
            }
        }
        user.money -= change;
        user.stocks += body.quantity;
        let key = user.id + ":" + body.ticker;
        let userStock = (await db.stock_ownerships.get(key)) || {key, user: user.id, ticker: body.ticker, quantity: 0};
        if(userStock){
            userStock.quantity += body.quantity;
        }
        await db.stock_ownerships.put(userStock);
        await users.putUser(user);
    }else if(body.action == "sell"){
        let key = user.id + ":" + body.ticker;
        let userStock = (await db.stock_ownerships.get(key)) || {key, user: user.id, ticker: body.ticker, quantity: 0};
        if(userStock.quantity < body.quantity){
            return {
                statusCode: 400,
                body: "You do not own enough of this stock to sell for your requested amount. You currently have " + userStock.quantity + " of it. "
            }
        }
        user.money += change;
        user.stocks -= body.quantity;
        userStock.quantity -= body.quantity;
        await db.stock_ownerships.put(userStock);
        await users.putUser(user);
    }else{
        return {
            statusCode: 400,
            body: "Invalid action. "
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            ok: true,
            userUpdate: user
        })
    }
};


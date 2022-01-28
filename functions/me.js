const users = require("../shared/users");

exports.handler = async function (event, context) {
    let user = users.processContext(context);
    if(!user){
        return {
            statusCode: 403,
            body: "You need to be logged in."
        }
    }
    user = await users.userify(context);
    
    return {
        statusCode: 200,
        body: JSON.stringify(user)
    }
};


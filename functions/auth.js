// Auth test endpoint, to be removed outside of testing

exports.handler = async function (event, context) {
    if(!process.env.DETA_PROJECT || process.env.DETA_PROJECT.length > 10){
        return {
            statusCode: 403,
            body: "Endpoint disabled."
        }
    }
    const { identity, user } = context.clientContext;
    return {
        statusCode: 200,
        body: JSON.stringify({
            identity, user
        })
    }
};


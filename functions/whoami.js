// Auth test endpoint, to be removed outside of testing

exports.handler = async function (event, context) {
    const { identity, user } = context.clientContext;
    return {
        statusCode: 200,
        body: JSON.stringify({
            identity, user
        })
    }
};


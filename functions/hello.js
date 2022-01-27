exports.handler = async function (event, context) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Hello! Deta key length " + (process.env.DETA_PROJECT || "").length }),
    };
  }
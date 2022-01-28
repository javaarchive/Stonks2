module.exports = {
    processContext: (context) => {
        const claims = context.clientContext && context.clientContext.user;
        if (!claims) {
            return null;
        }
        return {
            user: claims.sub,
            raw: claims
        }
    }
}
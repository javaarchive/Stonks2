const db = require("./db");
const config = require("./config");
const { defaultUserData } = require("./config");

let self = {
    processContext: (context) => {
        const claims = context.clientContext && context.clientContext.user;
        if (!claims) {
            return null;
        }
        /*return {
            user: claims.sub,
            raw: claims
        }*/
        return {
            email: claims.email,
            from: claims.app_metadata.provider,
            avatar_url: claims.user_metadata.avatar_url,
            full_name: claims.user_metadata.full_name,
            id: claims.sub,
            key: claims.sub
        }
    },
    putUser: (user) => {
        return db.users.put(user);
    },
    getUser: (id) => {
        return db.users.get(id);   
    },getUserByEmail: async (email) => {
        let resp = await db.users.fetch({email});
        if(!resp || resp.items.length <= 0){
            return null;
        }
        return resp.items[0];   
    },userify: async (context) => {
        let userBasic = self.processContext(context);
        let userFetched = await self.getUser(userBasic.key);
        if(!userFetched){
            // create an account
            await self.putUser({...config.defaultUserData,...userBasic});
            return {...config.defaultUserData,...userBasic};
        }else{
            let userUpdated = {...config.defaultUserData,...userFetched,...userBasic};
            await self.putUser(userUpdated);
            return userUpdated;
        }
        
    }
}

module.exports = self;
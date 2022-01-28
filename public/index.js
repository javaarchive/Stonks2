// Identity Code

let identity = {
    genAuthHeader: async () => {
        if(!netlifyIdentity.currentUser()){
            return {};
        }
        let jwt = await netlifyIdentity.currentUser().jwt();
        return {
            "Authorization": `Bearer ${jwt}`
        }
    }
}

// Main Code


docReady(() => {
    let isLoggedIn = false;
    if(netlifyIdentity.currentUser()){
        isLoggedIn = true;
    }

    let root = document.getElementById("root");

    let fetchStocks = () => {};
    let fetchUsers = () => {};

    let app = new Vue({
    el: '#root',
        data: {
            stocks: [

            ],
            lb:[

            ],
            loggedIn: isLoggedIn,
            action_type: "buy",
            action_ticker: "GOOGL",
            action_quantity: 1,
            successfulAction: false
        },methods: {
            updateStocks: () => fetchStocks(),
            updateUsers: () => fetchUsers(),
            stockAction: async () => {
                // Compose into a form
                let data = {
                    action: app.action_type,
                    quantity: app.action_quantity,
                    ticker: app.action_ticker
                };
                let resp = await fetch("/.netlify/functions/perform_action",{
                    method: (app.action_type == "buy") ? "PUT":"DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        ...(await identity.genAuthHeader())
                    },
                    body: JSON.stringify(data)
                });
                if(resp.status == 200){
                    app.successfulAction = true;
                    fetchUsers();
                }else{
                    app.successfulAction = false;
                    alert("Server Error: " + (await resp.text()));
                }
            }
        }
    });

    netlifyIdentity.on('login', () => {
        app.loggedIn = true;
    });

    netlifyIdentity.on('logout', () => {
        app.loggedIn = false;
    });

    fetchStocks = async () => {
        fetch("/.netlify/functions/fetch_current_stocks", {
            method: "GET",
            headers: {
                ...(await identity.genAuthHeader())
            }
        }).then(resp => {
            if(resp.status == 200){
                resp.json().then(data => {
                    app.stocks = data.map(rawData => {
                        rawData.updatedTimeFormatted = (new Date(rawData.date)).toLocaleTimeString();
                        return rawData;
                    }); // update!
                });
            }else{
                resp.text().then(text => {
                    alert("Server gave an error for you: " + text);
                })
            }
        })
    }

    console.log("Launching Initial Stock Fetch");
    fetchStocks();

    if(netlifyIdentity.currentUser()){
        fetchUsers = async () => {
            fetch("/.netlify/functions/fetch_users", {
                method: "GET",
                headers: {
                    ...(await identity.genAuthHeader())
                }
            }).then(resp => {
                if(resp.status == 200){
                    resp.json().then(data => {
                        app.lb = data;
                    });
                }else{
                    resp.text().then(text => {
                        alert("Server gave an error for you: " + text);
                    })
                }
            })
        }

        console.log("Launching Initial Leaderboard fetch");
        fetchUsers();
    }
    
});
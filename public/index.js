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
            action_quantity: 1
        },methods: {
            updateStocks: () => fetchStocks(),
            updateUsers: () => fetchUsers()
        }
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
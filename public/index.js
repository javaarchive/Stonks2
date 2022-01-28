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

    let fetchStocks;

    let app = new Vue({
    el: '#root',
        data: {
            stocks: [

            ],
            loggedIn: isLoggedIn
        },methods: {
            updateStocks: () => fetchStocks()
        }
    });

    fetchStocks = () => {
        fetch("/.netlify/functions/fetch_current_stocks", {
            method: "GET",
            headers: {
                ...identity.genAuthHeader()
            }
        }).then(resp => {
            if(resp.status == 200){
                resp.json().then(data => {
                    app.stocks = data; // update!
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
    
});
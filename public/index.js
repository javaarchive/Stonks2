// Identity Code

let identity = {
    genAuthHeader: () => {
        if(!netlifyIdentity.currentUser()){
            return {};
        }
        return {
            "Authorization": `Bearer ${netlifyIdentity.currentUser().jwt()}`
        }
    }
}

// Main Code

docReady(() => {
    let root = document.getElementById("root");
    
    let app = new Vue({
    el: '#root',
        data: {
            stocks: [

            ]
        },methods: {

        }
    });

    console.log("Launching Initial Stock Fetch");
    fetch("/.netlify/functions/fetch_current_stocks", {
        method: "GET",
        headers: {
            source: "initial-fetch",
            ...identity.genAuthHeader()
        }
    }).then(resp => {
        console.log("Initial Stock Fetched Finished");
        if(resp.status == 200){
            resp.json().then(data => {
                app.stocks = data.items; // update!
            });
        }else{
            resp.text().then(text => {
                alert("Server gave an error for you: " + text);
            })
        }
    })
    
});
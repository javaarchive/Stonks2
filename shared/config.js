module.exports = {
    tickers: [
        "AAPL",
        "MSFT",
        "AMZN",
        "GOOG",
        "FB",
        "TWTR",
        "NFLX",
        "TSLA",
        "GME",
        "NVDA",
        "IBM",
        "AMD",
        "AMC",
        "INTC"
    ],
    fetchIntervalLimit: 1000 * 60 * 2 - 5000, // slightly less than 2 minutes
    defaultUserData: {
        money: 1000.00
    }
}
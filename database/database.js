const sqlite3 = require("sqlite3")

const db = new sqlite3.Database("./data.db", (err) => {
    if(err) {
        console.log(err)
    }else {
        console.log("connnected")
    }
})

module.exports = db
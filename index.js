const express = require('express')
const xRequest = require('./xRequest')

require('dotenv').config()

const { PORT } = process.env
const app = express()
const data = {}

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get("/", async (req, res) => {
    res.send("xLists API running")
})
app.get('/get', async (req, res) => {
    const { id } = req.query
    if (!id) {
        res.send("Id is missing");
        return
    }
    if (!data[id]) {
        try {
            data[id] = await xRequest(id)
        } catch (e) {
            console.log(e)
            res.send([])
            return
        }
    }
    res.send(data[id])
})

if (!PORT) {
    console.log("Environment variable PORT is required")
    process.exit(1)
}

setInterval(async () => {
    let ids = Object.keys(data)
    for (let i = 0; i < ids.length; i++) {
        let id = ids[i]
        data[id] = await xRequest(id)
    }
}, 1000 * 60 * 30)

app.listen(PORT)
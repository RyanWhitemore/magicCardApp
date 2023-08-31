const express = require("express")
const { addCardToDb, getCardsByUserId, deleteCardFromDb } = require("./routeFunctions")
const cors = require("cors")


const app = express()
const port = 5000


app.use(express.urlencoded())
app.use(express.text())
app.use(express.json())

app.use(cors())

app.get("/getCards", (req, res) => {
    getCardsByUserId(req, res)
})

app.put("/addCard", (req, res) => {
    addCardToDb(req, res)
})

app.delete("/deleteCard", (req, res) => {
    deleteCardFromDb(req, res)
})

app.listen(port)

const { MongoClient, ServerApiVersion } = require("mongodb")
const path = require("path")
require("dotenv").config({path: path.resolve(__dirname, "./.env")})

const uri = process.env.LOCALDBSTRING

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict:true,
        deprecationErrors:true,
        connectTimeoutMS: 60000
    }


});

const magicCards = client.db("magicCards")

magicCards.createCollection("magicCards", (err, res) => {
    if (err) throw err
})

magicCards.createCollection("userCards", (err, res) => {
    if (err) throw err
})

magicCards.createCollection("userDecks", (err, res) => {
    if (err) throw err
})

magicCards.createCollection("users", (err, res) => {
    if (err) throw err
})
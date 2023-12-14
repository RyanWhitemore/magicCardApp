const { MongoClient, ServerApiVersion } = require("mongodb")
const path = require("path")
require("dotenv").config({path: path.resolve(__dirname, "./.env")})

const uri = process.env.CONNECTIONSTRING

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict:true,
        deprecationErrors:true,
        connectTimeoutMS: 60000
    }


});

module.exports = client
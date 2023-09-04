const client = require("./connect")

const getUserFromDBByUsername = (username, callback) => {

    try {
        const database = client.db("magicCards")
        const collection = database.collection("users")

        const results = collection.findOne({username: username})

        return callback(results)


    } catch(err) {
        throw (err)
    }

};

const getUserFromDB = (id, callback) => {
    const database = client.db("magicCards")
    const collection = database.collection("users")

    const results = collection.findOne({user_id: id})

    callback(results)
}


module.exports = {getUserFromDBByUsername, getUserFromDB}
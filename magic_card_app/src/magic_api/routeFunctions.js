const client = require("./connect")
const bcrypt = require("bcrypt")

const addCardToDb = async (req, res) => {

    const userId = req.body.userId
    const card = req.body.card

    card.userId = userId

    try {

        const collection = client.db("magicCards")

        const magicCards = collection.collection("magicCards")

        await magicCards.insertOne(card)

        res.status(200).send()

    } catch (err) {
        res.status(400).send()
        throw(err)
    }

}

const registerUser = async (req, res) => {

    console.log(req.body.username.toLowerCase())

    const makeID = (length) => {
        let result = "";
        const characters = 'ABCDEFGHIJKKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        const charactersLength = characters.length
        let counter = 0
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result
    }

    const {username, password } = req.body

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    let userID = makeID(36) 

    const user = {username: username.toLowerCase(), password: hash, userID}

    const database = client.db("magicCards")
    const collection = database.collection("users")

    const usernameResults = await collection.findOne({username: username})

    const userIDResults = await collection.findOne({userID})

    if (!usernameResults) {
        if (!userIDResults) {
            await collection.insertOne(user)
            res.status(200).send()
        } else {
            registerUser(req, res)
        }
        
    } else {
        res.status(400).send({
            message: "Username taken"
        })
    }
}


const getCardsByUserId = async (req, res) => {

    const cardArray = []

    const userID = req.params.userID

    try {

        const collection = client.db("magicCards")

        const magicCards = collection.collection("magicCards")

        const options = {
            sort: {"name": 1}        
        }

        const query = {userId: userID}

        const results = magicCards.find(query, options)

        for  await (const doc of results) {
            cardArray.push(doc)
        }

        res.send(cardArray)

    } catch (err) {
        throw(err)
    }

} 


const deleteCardFromDb = async (req, res) => {
    const cardId = req.query.cardId
    const cardUserID = req.query.userId

    try {
        
        const collection = client.db("magicCards")
        const magicCards = collection.collection("magicCards")

        const query = {id: cardId, userId: cardUserID}

        await magicCards.deleteOne(query)

        res.status(200)

    } catch  (err) {
        res.status(400).send()
        throw(err)
    }
}

module.exports = {
    addCardToDb: addCardToDb,
    getCardsByUserId: getCardsByUserId,
    deleteCardFromDb: deleteCardFromDb,
    registerUser: registerUser
}
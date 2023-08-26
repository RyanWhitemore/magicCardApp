const client = require("./connect")

const addCardToDb = async (req, res) => {

    const userId = req.body.userId
    const card = req.body.card

    card.userId = userId

    try {

        const collection = client.db("magicCards")

        const magicCards = collection.collection("magicCards")

        await magicCards.insertOne(card)

    } finally {
        client.close()
    }

}


const getCardsByUserId = async (req, res) => {

    const cardArray = []

    try {

        const collection = client.db("magicCards")

        const magicCards = collection.collection("magicCards")

        const options = {
            sort: {"name": 1}        
        }

        const query = {userId:2}

        const results = magicCards.find(query, options)

        for  await (const doc of results) {
            cardArray.push(doc)
        }

        res.send(cardArray)

    } catch (err) {
        throw(err)
    }

} 


module.exports = {
    addCardToDb: addCardToDb,
    getCardsByUserId: getCardsByUserId
}
const client = require("./connect")
const bcrypt = require("bcrypt")

const addCardToDb = async (req, res) => {

    const userID = req.body.userId
    const card = req.body.card

    try {

        const collection = client.db("magicCards")

        const magicCards = collection.collection("magicCards")

        const userCards = collection.collection("userCards")

        

        let results = magicCards.findOne({id: card.id})
        results = await results

        if (!results) {
            magicCards.insertOne(card)
        }
        
        let user = userCards.findOne({userID})
        user = await user

        if (!user.cards) {
            const cardIdObj = {cards: [{cardID: card.id, quantity: 1}]}
            await userCards.updateOne({userID}, {$set: cardIdObj})
        } else {
            const cardIdArray = await userCards.findOne({userID})
            const cardFound = cardIdArray.cards.find((element) => {
                return element.cardID === card.id
            })
            if (cardFound) {
                const quantity = cardFound.quantity + 1
                const res = await userCards.updateOne({ userID, "cards.cardID": card.id }, {$set: {"cards.$.quantity": quantity}})
            } else {
                await userCards.updateOne({userID}, {$push: {cards: {cardID: card.id, quantity: 1, cardName: card.name}}})
            }
           

        }

        

        res.status(200).send()

    } catch (err) {
        res.status(400).send()
        console.log(err)
    }

}

const registerUser = async (req, res) => {

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

    const userCards = database.collection("userCards")

    const usernameResults = await collection.findOne({username: username})

    const userIDResults = await collection.findOne({userID})

    if (!usernameResults) {
        if (!userIDResults) {
            await userCards.insertOne({userID, cards: []})
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

    const userID = req.params.userID

    try {

        const collection = client.db("magicCards")

        const magicCards = collection.collection("magicCards")

        const userCards = collection.collection("userCards")

        const query = {userID}

        let results = userCards.findOne(query)

        results = await results
        let cardIDs = []

        results = results.cards.sort((a, b) => {
            return a.cardID.localeCompare(b.cardID)
        })

        for (const card of results) {
            cardIDs.push(card.cardID)
        }
 
        let cards = await magicCards.find({id: {$in: cardIDs}}).toArray()
        
        cards = cards.sort((a, b) => {
            return a.id.localeCompare(b.id)
        })

        cards = cards.map((card, i) => {
            
            card.quantity = results[i].quantity
            return card
        })

        res.send(cards)

    } catch (err) {
        throw(err)
    }

} 


const deleteCardFromDb = async (req, res) => {
    const cardID = req.query.cardId
    const userID = req.query.userId

    try {
        
        const collection = client.db("magicCards")
        const userCards = collection.collection("userCards")

        let results = await userCards.updateOne({userID},
            {$pull: {cards: {cardID, quantity:1}}})


        if (results.modifiedCount === 0) {
            await userCards.updateOne({userID, "cards.cardID": cardID}, 
                {$inc: {"cards.$.quantity": -1}})
        }

        res.status(200)

    } catch  (err) {
        res.status(400).send()
        console.log(err)
    }
}

const searchMyCards = async (req, res) => {
    const userID = req.params.userID
    const searchTerm = req.params.searchTerm

    try {

        const database = client.db("magicCards")

        const userCards = database.collection("userCards")

        const magicCards = database.collection("magicCards")

        const results = await userCards.find({userID, "cards.cardName": searchTerm}).toArray()

        if (results.length > 0) {
            for (const card of results[0].cards) {
                if (card.cardName === searchTerm) {
                    const matchedCard = await magicCards.findOne({name: searchTerm})
                    if (matchedCard) {
                        matchedCard.quantity = 1
                        return res.send(matchedCard)
                    } else {
                        return res.send([])
                    }
                    
                }
            }
        } else {
            res.status(404).send()
        }
        


    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    addCardToDb: addCardToDb,
    getCardsByUserId: getCardsByUserId,
    deleteCardFromDb: deleteCardFromDb,
    registerUser: registerUser,
    searchMyCards: searchMyCards
}
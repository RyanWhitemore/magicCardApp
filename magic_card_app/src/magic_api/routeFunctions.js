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

        if (userID === "guest") {
            return res.status(200).send()
        }

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
        console.log(err)
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

        const results = await userCards.find({userID, "cards.cardName": {$regex: searchTerm, $options: "i"}}).toArray()

        if (results.length > 0) {
            for (const card of results[0].cards) {
                if (new RegExp(searchTerm, "i").exec(card.cardName)) {
                    const matchedCard = await magicCards.findOne({name:  {$regex: searchTerm, $options: "i"}})
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

const saveDeck = async (req, res) => {
    const userID = req.body.userID
    const deckID = req.body.deckID
    const cardsArray = req.body.cards
    const commanderID = req.body.commanderID
    let queryObj = {deckID: deckID, commander: commanderID, cards: cardsArray} 

    const database = client.db("magicCards")

    const userDecks = database.collection("userDecks")

    let deckList = userDecks.find({userID}).toArray()

    deckList = await deckList

    if (deckList[0]?.decks) {
        for (const deck of deckList[0].decks) {
            if (deck.deckID === deckID) {
                return res.status(200).send()
            }
        }
    }
    
    if (deckList.length <= 0) {
        userDecks.insertOne({userID, decks: [queryObj]})
    } else {
        const newDecksList = deckList[0].decks
        
        newDecksList.push(queryObj)
        userDecks.updateOne({userID}, {$set: {decks: newDecksList}})
    }

    res.status(200).send()
}

const getDecksFromDB = async (req, res) => {
    const userID = req.params.userID

    const database = client.db("magicCards")

    const userDecks = database.collection("userDecks")

    let deckList = userDecks.find({userID}).toArray()

    deckList = await deckList

    console.log(deckList[0]?.decks)

    res.status(200).send(deckList[0]?.decks)

} 

module.exports = {
    getDecksFromDB: getDecksFromDB,
    saveDeck: saveDeck,
    addCardToDb: addCardToDb,
    getCardsByUserId: getCardsByUserId,
    deleteCardFromDb: deleteCardFromDb,
    registerUser: registerUser,
    searchMyCards: searchMyCards
}
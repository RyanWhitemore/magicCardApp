const express = require("express")
const { addCardToDb, 
        getCardsByUserId, 
        deleteCardFromDb, 
        registerUser,
        searchMyCards,
         } = require("./routeFunctions")
const cors = require("cors")
const passport = require("passport")
const session = require("express-session")
const { getUserFromDBByUsername } = require("./helper")
const MongoStore = require("connect-mongo")
require('./passportConfig')


const app = express()
const port = 5000

app.use(session({
    secret: "3",
    cookie: {maxAge: 60 * 60 * 1000, sameSite: "lax"},
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
        mongoUrl: process.env.CONNECTIONSTRING,
        ttl: 14 * 24 * 60 * 60,
        autoRemove: "native"
    })
}))
app.use(express.urlencoded({extended: true}))
app.use(express.text())
app.use(express.json())

app.use(cors())

app.get("/failure", (req, res) => {
    res.send({message: "failure"})
})

app.get("/getCards/:userID", (req, res) => {
    getCardsByUserId(req, res)
})

app.get("/myCards/:userID/:searchTerm", (req, res) => {
    searchMyCards(req, res)
})

app.put("/addCard", (req, res) => {
    addCardToDb(req, res)
})

app.delete("/deleteCard", (req, res) => {
    deleteCardFromDb(req, res)
})

app.post('/login',  passport.authenticate('local', { failureRedirect: '/failure'}), 
(req, res) => {
    res.redirect("/user/" + req.body.username)
    return;
})

app.get("/user/:username", (req, res) => {
    getUserFromDBByUsername(req.params.username, async (user) => {
        user = await user
        try {
            if (!user) {
                return res.send(false)
            } else {
                return res.json(user.userID)
            }
        } catch (err) {
            res.sendStatus(500)
            throw (err);
        }
    })
})

app.post("/session", (req, res) => {
    const { userID, deck } = req.body
    req.session.deck = {userID: userID, deck: deck}

    req.session.save()

    res.status(200).send()
})

app.post("/logout", (req, res) => {
    req.session.destroy()

    res.status(200).send()
})

app.post('/register', registerUser)

app.listen(port)

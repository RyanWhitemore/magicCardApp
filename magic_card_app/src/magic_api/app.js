const express = require("express")
const { addCardToDb, getCardsByUserId, deleteCardFromDb, registerUser } = require("./routeFunctions")
const cors = require("cors")
const passport = require("passport")
const session = require("express-session")
const { getUserFromDBByUsername } = require("./helper")
require('./passportConfig')


const app = express()
const port = 5000


app.use(session({
    secret: "3",
    cookie: {maxAge: 60 * 60 * 1000, sameSite: "lax"},
    saveUninitialized: false,
    resave: false
}))
app.use(express.urlencoded())
app.use(express.text())
app.use(express.json())

app.use(cors())

app.get("/failure", (req, res) => {
    res.send({message: "failure"})
})

app.get("/getCards/:userID", (req, res) => {
    getCardsByUserId(req, res)
})

app.put("/addCard", (req, res) => {
    console.log("called")
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

app.post('/register', registerUser)

app.listen(port)

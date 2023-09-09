const passport = require('passport')
const {getUserFromDB, getUserFromDBByUsername} = require('./helper')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt')

passport.serializeUser((user, done) => {
    return done(null, user.userID)
})

passport.deserializeUser((id, done) => {
    getUserFromDB(id, async (user) => {
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    });
    
})

passport.use(new LocalStrategy( async (username, password, done,) => {
    getUserFromDBByUsername(username, async (userPromise) => {
        const user = await userPromise
        try {
            if (!user) {
                return done(null, false)
            }
            const passwordMatched = await bcrypt.compare(password, user.password);
            if (passwordMatched) {
                console.log('password matched')
                return done(null, user)
            } else {
		console.log("password wrong")
                return done(null, false)
            }
        } catch(error) {
            console.log(error)
        }
        })     
    })
);

module.exports = {passport}
import {React, useEffect, useState} from "react";
import axios from "axios";
import Card from "./Card";
import Header from "./Header";
import { useLocation } from "react-router-dom";
import Popup from "reactjs-popup";
import styles from "./Home.module.css"



const Home = ({  
        fromDeckBuilder, 
        addedCards, 
        setAddedCards,
        deckCost,
        setDeckCost }) => {

    const [ userID, setUserID ] = useState("guest")

    const [ loginClicked, setLoginClicked ] = useState(false)

    const [ defaultCards, setDefaultCards ] = useState()

    const [cards, setCards] = useState([])

    const [ suggestions, setSuggestions ] = useState([])

    const [ username, setUsername ] = useState("")

    const [ password, setPassword ] = useState("")

    const [ search, setSearch ] = useState("")

    const getDefaultCards = async () => {

        if (fromDeckBuilder) {
            if (localStorage.getItem("userID")) {

                const results = await axios.get("http://localhost:5000/getCards/" + localStorage.getItem("userID")
                )

                setDefaultCards(results.data)
    }
        } else {
            const results = await axios.get("https://api.scryfall.com/sets/aer")

            const cardResults = await axios.get(results.data.search_uri)

            setDefaultCards(cardResults.data.data)
        }
        
        
    }
    
    const location = useLocation()

    const checkIfFromCard = () => {
        if (location.state) {
            if (location.state.cards) {
                setCards(location.state.cards)
            } else {
                getDefaultCards()
            }
        } else {
            getDefaultCards()
        }
    }

    useEffect(() => {

        console.log(addedCards)

        if (localStorage.getItem("userID")) {
            setUserID(localStorage.getItem("userID"))
        }

        checkIfFromCard()

    }, [setDefaultCards, localStorage.getItem("userID")])
    
    const changePassword = (e) => {
        e.preventDefault()

        setPassword(e.target.value)
    }

    const changeUsername = (e) => {
        e.preventDefault()

        setUsername(e.target.value)
    }

    const handleChange = async (e) => {
        e.preventDefault()

        setSearch(e.target.value)

        const results = await axios.get("https://api.scryfall.com/cards/autocomplete?q=" + e.target.value)

        setSuggestions(results.data.data)
    }
    

    const searchByName = async (e) => {
        try {
            setDefaultCards(null)
            const results = await axios.get("https://api.scryfall.com/cards/search?q=" + search )
            setCards(results.data.data)
        } catch {
            return <>
                <form onSubmit={(e) => {e.preventDefault(); searchByName(e)}}>
                    <input type="text" placeholder="Search" value={search}
                    onChange={handleChange}/>
                    <button>Search</button>
                </form>
            </>
        }
    }

    const login = async (e) => {
        e.preventDefault()
        const results = await axios.post("http://localhost:5000/login", {
            username: username.toLowerCase(), password: password
        })

        if (!results.data.message) {
            setUserID(results.data)
            localStorage.setItem("userID", results.data)
            setLoginClicked(!loginClicked)
        } else {
            console.log("login failed")
        }
        
    }
    

    return <>
    <Popup 
        open={loginClicked} 
        modal
        nested    
    > 
        {close => (
            <div className="modal">
                <div className={styles.header}>Login</div>
                <button className={styles.close} onClick={() => {close(); setLoginClicked(!loginClicked)}}>
                    &times;
                </button>
                <div className={styles.content}>
                    <form onSubmit={login}>
                        <div className={styles.username}>
                            <input 
                                type="text" 
                                onChange={changeUsername} 
                                placeholder="username">
                            </input>
                        </div>
                        <div className={styles.password}>
                            <input 
                                type="text" 
                                onChange={changePassword} 
                                placeholder="password">
                            </input>
                        </div>
                        <button className={styles.loginbutton} type="submit">Login</button>
                    </form>
                </div>

            </div>    
        )}
        
    </Popup>
    <Header 
        setLoginClicked={setLoginClicked}  
        loginClicked={loginClicked} 
        fromHome={true}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
        search={search}
        setSearch={setSearch}
        defaultCards={defaultCards}
        setDefaultCards={setDefaultCards}
        cards={cards}
        setCards={setCards}/>
    <div id="main">
        {cards && <div className={styles.cards}>
            {cards.map(card => {
                return <div key={card.id}>
                    <Card
                    cards={cards}
                    withButton={true} 
                    card={card}
                    fromDeckBuilder={fromDeckBuilder}
                    deckCost={deckCost}
                    setDeckCost={setDeckCost}
                    />
                </div>
            })}
            </div>}
        {defaultCards && <div className={styles.cards}>
                {defaultCards.map(card => {
                    return <div key={card.id}>
                        <Card 
                        fromDeckBuilder={fromDeckBuilder}
                        addedCards={addedCards}
                        setAddedCards={setAddedCards}
                        card={card}
                        setDeckCost={setDeckCost}
                        deckCost={deckCost}
                        />
                    </div>
                })}
            </div>}
        
    </div>
    </>
}

export default Home
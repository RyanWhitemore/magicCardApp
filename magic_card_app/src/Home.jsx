import {React, useEffect, useState} from "react";
import axios from "axios";
import Card from "./Card";
import Header from "./Header";
import { useLocation } from "react-router-dom";
import Popup from "reactjs-popup";
import "./Home.css"



const Home = ({ search, setSearch, fromDeckBuilder, addedCards, setAddedCards }) => {

    const [ userID, setUserID ] = useState("guest")

    const [ loginClicked, setLoginClicked ] = useState(false)

    const [ defaultCards, setDefaultCards ] = useState()

    const [cards, setCards] = useState([])

    const [ suggestions, setSuggestions ] = useState([])

    const [ username, setUsername ] = useState("")

    const [ password, setPassword ] = useState("")

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
                <div className="header">Login</div>
                <button className="close" onClick={() => {close(); setLoginClicked(!loginClicked)}}>
                    &times;
                </button>
                <div className="content">
                    <form onSubmit={login}>
                        <div className="username">
                            <input 
                                type="text" 
                                onChange={changeUsername} 
                                placeholder="username">
                            </input>
                        </div>
                        <div className="password">
                            <input 
                                type="text" 
                                onChange={changePassword} 
                                placeholder="password">
                            </input>
                        </div>
                        <button className={"login-button"} type="submit">Login</button>
                    </form>
                </div>

            </div>    
        )}
        
    </Popup>
    <Header setLoginClicked={setLoginClicked}  loginClicked={loginClicked} fromHome={true}/>
    <div id="main">
        <form onSubmit={(e) => {e.preventDefault(); searchByName(e)}}>
            <input className="search" list="suggestions" type="text" placeholder="Search" 
            value={search}
            onChange={handleChange}/>
                <datalist id="suggestions">
                    {suggestions.map((item) => {
                        return <option>{item}</option>
                    })}
                </datalist>
        </form>
        {cards && <div className="cards">
            {cards.map(card => {
                return <div key={card.id}>
                    <Card
                    cards={cards}
                    withButton={true} 
                    card={card}
                    fromDeckBuilder={fromDeckBuilder}
                    />
                </div>
            })}
            </div>}
        {defaultCards && <div className="cards">
                {defaultCards.map(card => {
                    return <div key={card.id}>
                        <Card 
                        fromDeckBuilder={fromDeckBuilder}
                        addedCards={addedCards}
                        setAddedCards={setAddedCards}
                        card={card}
                        />
                    </div>
                })}
            </div>}
        
    </div>
    </>
}

export default Home
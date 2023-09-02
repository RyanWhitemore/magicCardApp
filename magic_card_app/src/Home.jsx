import {React, useEffect, useState} from "react";
import axios from "axios";
import Card from "./Card";
import { Link, useLocation } from "react-router-dom";
import "./Home.css"



const Home = () => {

    const [ defaultCards, setDefaultCards ] = useState()

    const [search, setSearch] = useState("")

    const [cards, setCards] = useState([])

    const [ suggestions, setSuggestions ] = useState([])

    const getDefaultCards = async () => {
        const results = await axios.get("https://api.scryfall.com/sets/who")

        const cardResults = await axios.get(results.data.search_uri)

        setDefaultCards(cardResults.data.data)
        
    }
    

    useEffect(() => {
    
        getDefaultCards()

    }, [setDefaultCards])
    
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


    return <>
    <header className="header">
        <div className="section">
            <Link id="mycards" to="/mycards">My Cards</Link>
        </div>
    </header>
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
                return <>
                    <Card 
                    cards={cards}
                    withButton={true} 
                    card={card}/>
                </>
            })}
        {defaultCards && <div className="cards">
                {defaultCards.map(card => {
                    return <>
                        <Card 
                        withButton={true}
                        card={card}
                        />
                    </>
                })}
            </div>}
        </div>}
    </div>
    </>
}

export default Home
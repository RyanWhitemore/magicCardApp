import {React, useState} from "react";
import axios from "axios";
import Card from "./Card";
import { Link } from "react-router-dom";
import "./Home.css"



const Home = () => {

    const [search, setSearch] = useState("")

    const [cards, setCards] = useState([])

    const [ suggestions, setSuggestions ] = useState([])

    
    const handleChange = async (e) => {
        e.preventDefault()

        setSearch(e.target.value)

        const results = await axios.get("https://api.scryfall.com/cards/autocomplete?q=" + e.target.value)

        setSuggestions(results.data.data)
    }
    
    const searchByName = async (e) => {
        try {
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
        <div className="cards">
            {cards.map(card => {
                return <>
                    <Card 
                    withButton={true} 
                    card={card}/>
                </>
            })}
        </div>
    </div>
    </>
}

export default Home
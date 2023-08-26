import {React, useState, useEffect} from "react";
import axios from "axios";
import Card from "./Card";



const Home = () => {

   


    const [search, setSearch] = useState("")

    const [ criteria, setCriteria ] = useState("name")

    const [cards, setCards] = useState({data: {cards: []}})

    const searchByName = async (e) => {
        const results = await axios.get("https://api.magicthegathering.io/v1/cards?" + criteria + "=" + search )
        setCards(results)
    }

    console.log(cards.data.cards)

    return <>
        <form onSubmit={(e) => {e.preventDefault(); searchByName(e)}}>
            <input type="text" placeholder="Search" value={search}
            onChange={(e) => {setSearch(e.target.value)}}/>
            <button>Search</button>
            <select onChange={e => {setCriteria(e.target.value)}} defaultValue={criteria} value={criteria}>
                <option value="name">Name</option>
                <option value="cmc">Converted Mana Cost</option>
                <option value="colors">Colors</option>
                <option value="types">Types</option>
            </select>
        </form>
        {cards.data.cards.map(card => {
            return <>
                <Card card={card}/>
            </>
        })}
    </>
}

export default Home
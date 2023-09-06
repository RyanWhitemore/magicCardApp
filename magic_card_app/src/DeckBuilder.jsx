import Home from "./Home"
import "./DeckBuilder.css"
import { useEffect, useState } from "react"
import Card from "./Card"

const DeckBuilder = () => {

    const [ addedCards, setAddedCards ] = useState([])

    useEffect(() => {
        console.log(addedCards)
    }, [addedCards])

    return <>
        <div className="flex-container">
            <div>
                <Home 
                fromDeckBuilder={true}
                addedCards={addedCards}
                setAddedCards={setAddedCards}
                />
            </div>
            <div className="cards">
            <header className="header">Deck</header>
                {addedCards.map((card) => {
                    return <Card card={card}/>
                })}
            </div>
        </div>
        
    </>
}

export default DeckBuilder
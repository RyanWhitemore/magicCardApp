import "./Card.css"
import axios from "axios"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const Card = ({
        card, 
        withButton,
        fromCardPage,
        fromMyCards,
        cards,
        fromDeckBuilder,
        setAddedCards,
        addedCards,
        inDeck,
        chosenDeckType,
        deckCost,
        setDeckCost,
        setCommander,
        setIsCommander,
        isCommander
    }) => {


    let button
    let deleteButton
    let cardImage
    let addButton
    let quantity
    let commanderButton

    const navigate = useNavigate()

    const userID = localStorage.getItem("userID")

    const [ deckCount, setDeckCount ] = useState(1)

    const [ numInColl, setNumInColl ] = useState(card.quantity)

    const buyCard = () => {
        window.open(card.purchase_uris.tcgplayer, "_blank")
    }

    const checkArrayForObj = (obj, array) => {
        for (let i =0; i < array.length; i++) {
            if (array[i] === obj) {
                return true
            }
        }
        return false
    }

    const addCommander = () => {
        if (card.legalities[chosenDeckType] === "legal") {
            setCommander(card)
            setIsCommander(true)
        }
    }

    const addCard = (e) => {
        if (checkArrayForObj(card, addedCards)) {
            return
        }
        if (!chosenDeckType | card.legalities[chosenDeckType] === "legal") {
            if (!card.prices.usd) {
                setAddedCards(prevArray => [...prevArray, card])
            } else {
                let newDeckCost = parseFloat(deckCost) + parseFloat(card.prices.usd)
                newDeckCost = parseFloat(newDeckCost)
                newDeckCost = newDeckCost.toFixed(2)
                setDeckCost(newDeckCost)
                setAddedCards(prevArray => [...prevArray, card])

            }
        } else {
            return
        }
       
    }

    const addCardInDeck = () => {
        if (chosenDeckType === "commander") {
            return 
        } else {
            if (deckCount < 4) {
                let newDeckCost = parseFloat(deckCost) + parseFloat(card.prices.usd)
                newDeckCost = parseFloat(newDeckCost)
                newDeckCost = newDeckCost.toFixed(2)
                setDeckCost(newDeckCost)
                setDeckCount(deckCount + 1)
            }
        }
    }
    
    const removeCardInDeck = () => {
        if (isCommander) {
            return setCommander(false)
        } else {
            if (card.prices.usd) {
                let newDeckCost = parseFloat(deckCost) - parseFloat(card.prices.usd)
                newDeckCost = parseFloat(newDeckCost)
                newDeckCost = newDeckCost.toFixed(2)
                setDeckCost(newDeckCost)
            }
            if (deckCount > 1) {
                setDeckCount(deckCount - 1)
            } else {
                const newAddedCards = [...addedCards]
                const indexToRemove = addedCards.indexOf(card)
                newAddedCards.splice(indexToRemove, 1)
                setAddedCards(newAddedCards)
            }
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.put("http://localhost:5000/addCard", {
            card: card,
            userId: userID
        })
        setNumInColl(card.quantity + 1)
    }

    const handleDelete = (e) => {
        e.preventDefault()
        axios.delete("http://localhost:5000/deleteCard?cardId=" 
            + card.id + "&userId=" + userID)
        navigate("/mycards")
    }

    if (numInColl < 1) {
        return
    } 

    if (fromDeckBuilder) {
        addButton = <>
            <button value={card} onClick={addCard}>Add to Deck</button>
        </>
        if ((chosenDeckType === "commander" && 
            card.type_line.includes("Legendary Creature")) | 
            (chosenDeckType === "commander" && 
            card.type_line.includes("Legendary Planeswalker"))) {
                commanderButton = <>
                <button value={card} onClick={addCommander}>Add as Commander</button>        
        </>
        }
    }

    if (withButton === true) {
        button = <form onSubmit={handleSubmit}>
                    <button className="add-card" type="submit">
                        Add card
                    </button>
                </form>
    }

    if (fromMyCards === true) {
        quantity = <p className="quantity">Quantity owned: {numInColl}</p>
        deleteButton = <form onSubmit={handleDelete}>
            <button type="submit">Delete card</button>
        </form>
                     
    }       
    if (fromCardPage === true) {
        if (card.image_uris) {
                cardImage =  <>
                <img 
                    src={card.image_uris.border_crop} 
                    alt={card.name}
                ></img>
                <button 
                    className="buy-card" 
                    onClick={buyCard}>
                    Buy Card ${card.prices.usd}
                </button>
                {deleteButton}
                <Link className="back" to="/" state={{cards: cards, fromElswhere: true}}>&times;</Link>
            </>
        } else {
            cardImage = <>
                <p>{card.name}</p>
                <p></p>
                <p></p>
                <p></p>
                <p></p>
            </>
        }
        
    } else {
        if (card.image_uris) {
            cardImage = <>
            <Link to="/CardPage" state={{card: card, fromMyCards: fromMyCards, cards: cards}}>
                <img 
                    width="180px"
                    src={card.image_uris.border_crop} 
                    alt={card.name}
                ></img>
            </Link>
            {addButton}
            {commanderButton}
        </> 
    } else {
        cardImage = <>
            <p>{card.name}</p>
            <p></p>
            <p></p>
            <p></p>
            <p></p>
        </>
    }
        }
        
        return <>
            <div className="image">
                {cardImage}
                {button}
                {inDeck && <div>
                    <button onClick={addCardInDeck}>Add</button>
                    <p>{deckCount}</p>
                    <button onClick={removeCardInDeck}>Remove</button>
                </div>}
                {card.prices && <p className="price">${card.prices.usd}</p>}
                {quantity}
                {fromMyCards && <>
                    <button onClick={(e) => {
                        e.preventDefault()
                        handleSubmit(e)
                        setNumInColl(numInColl + 1)
                    }}>Add</button>
                    <button onClick={(e) => {
                        e.preventDefault()
                        handleDelete(e)
                        setNumInColl(numInColl - 1)
                    }}>Delete</button>
                </>}
            </div>
    </>

   
    
    
}

export default Card
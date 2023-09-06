import "./Card.css"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"

const Card = ({
        card, 
        withButton,
        fromCardPage,
        fromMyCards,
        cards,
        fromDeckBuilder,
        setAddedCards,
        addedCards
    }) => {

    let button
    let deleteButton
    let cardImage
    let addButton

    const navigate = useNavigate()

    const userID = localStorage.getItem("userID")

    const buyCard = () => {
        window.open(card.purchase_uris.tcgplayer, "_blank")
    }

    const addCard = (e) => {
        setAddedCards(prevArray => [...prevArray, card])
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(userID)
        axios.put("http://localhost:5000/addCard", {
            card: card,
            userId: userID
        })
    }

    const handleDelete = (e) => {
        e.preventDefault()
        axios.delete("http://localhost:5000/deleteCard?cardId=" 
            + card.id + "&userId=" + userID)
        navigate("/mycards")
    }

    if (fromDeckBuilder) {
        addButton = <>
            <button value={card} onClick={addCard}>Add to Deck</button>
        </>
    }

    if (withButton === true) {
        button = <form onSubmit={handleSubmit}>
                    <button className="add-card" type="submit">
                        Add card
                    </button>
                </form>
    }

    if (fromMyCards === true) {
        deleteButton = <form onSubmit={handleDelete}>
            <button type="submit">Delete card</button>
        </form>
                     
    }       
    if (fromCardPage === true) {
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
            <Link to="/CardPage" state={{card: card, fromMyCards: fromMyCards, cards: cards}}>
                <img 
                    width="180px"
                    src={card.image_uris.border_crop} 
                    alt={card.name}
                ></img>
            </Link>
             {addButton}
        </> 
    }
    return <>
        
            <div className="image">
                {cardImage}
                {button}
            </div>
    </>
    
    
}

export default Card
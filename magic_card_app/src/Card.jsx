import "./Card.css"
import axios from "axios"
import { useState} from "react"
import { Link } from "react-router-dom"
import Popup from "reactjs-popup"

const Card = ({
        card, 
        withButton, 
        withDeleteButton,
        fromCardPage,
    }) => {

    let button
    let deleteButton
    let cardImage

    const [ open, setOpen ] = useState(false)

    const closeModal = () => setOpen(false)

    const buyCard = () => {
        window.open(card.purchase_uris.tcgplayer, "_blank")
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.put("http://localhost:5000/addCard", {
            card: card,
            userId: 2
        })
    }

    const handleDelete = (e) => {
        e.preventDefault()
        axios.delete("http://localhost:5000/deleteCard?cardId=" 
            + card.id + "&userId=" + 2)
    }


    if (withButton === true) {
        button = <button className="add-card" type="submit">Add card</button>
    }

    if (withDeleteButton === true) {
        deleteButton = <button type="submit">Delete card</button> 
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
            <Link className="back" to="/">&times;</Link>
        </>
    } else {
        cardImage = <Link to="/CardPage" state={{card: card}}>
                <img 
                    width="180px"
                    src={card.image_uris.border_crop} 
                    alt={card.name}
                ></img>
            </Link>
    }
    return <>
        
            <div className="image">
                {cardImage}
                {button}
                <Popup open={open}>
                    
                    <img
                    onClose={closeModal}
                    src={card.image_uris.border_crop}
                    alt={card.name}></img>
                    <form onSubmit={handleSubmit}>
                    {button}
                    </form>
                        
                    <form onSubmit={handleDelete}>
                        {deleteButton}
                    </form>
                </Popup>
            </div>
    </>
    
    
}

export default Card
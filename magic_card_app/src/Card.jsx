import "./Card.css"
import axios from "axios"

const Card = (card) => {

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(card.card)
        axios.put("http://localhost:5000/addCard", {
            card: card.card,
            userId: 2
        })
    }

    if (card.card.imageUrl) {
        return <>
            <div>
                <div className="image">
                    <img width="223" height="310" src={card.card.imageUrl} alt={card.name}></img>
                </div>
                <div className="label">
                    <form onSubmit={handleSubmit}>
                        <button>Add card</button>
                    </form>
                </div>
            </div>
        </>
    } else {
        return <>
            <div>
                <p>Name: {card.card.name}</p>
                <p>Mana Cost: {card.card.manaCost}</p>
                <p>Type: {card.card.type}</p>
                <p>Text: {card.card.text}</p>
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <button type="submit">Add card</button>
                </form>
            </div>
        </>
    }
    
}

export default Card
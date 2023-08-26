import axios from "axios"
import Card from "./Card"


const MyCards = async () => {
    const cards = await axios.get("http://localhost:5000/getCards")
    
    console.log(cards.data)

    return <>
        {cards.data.map((card) => {
            return <Card card={card}/>
        })}
    </>
}

export default MyCards
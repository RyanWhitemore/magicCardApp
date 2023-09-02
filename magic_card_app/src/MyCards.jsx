import axios from "axios"
import Card from "./Card"
import { useState, useEffect} from "react"
import { Link } from "react-router-dom"
import "./MyCards.css"


const MyCards = () => {

    const [ mycards, setmycards ] = useState(null)

    const getMyCards = async () => {
        const cards = await axios.get("http://localhost:5000/getCards")

        setmycards(cards.data)
    }

    useEffect(() => {
        getMyCards()
    }, [])
    
    return <>
         <header className="header">
            <div className="section">
                <Link id="back" to="/">Back</Link>
            </div>
        </header>
        {mycards && <>{mycards.map((card) => {
            return <Card 
                withButton={false} 
                card={card}
                withDeleteButton={true}
                fromMyCards={true}/>
        })}</>}
    </>
}

export default MyCards
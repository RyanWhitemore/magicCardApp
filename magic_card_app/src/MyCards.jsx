import axios from "axios"
import Card from "./Card"
import Header from "./Header"
import { useState, useEffect} from "react"
import { Link } from "react-router-dom"
import "./MyCards.css"


const MyCards = () => {

    const userID = localStorage.getItem("userID")

    const [ mycards, setmycards ] = useState(null)

    const getMyCards = async () => {
        const cards = await axios.get("http://localhost:5000/getCards/" + userID
        )

        setmycards(cards.data)
    }

    useEffect(() => {
        getMyCards()
    }, [])
    
    return <>
        <Header fromHome={false}/>
        <div className="cards">
            {mycards && <>{mycards.map((card) => {
                return <Card 
                    withButton={false} 
                    card={card}
                    withDeleteButton={true}
                    fromMyCards={true}
                    userID={userID}/>
            })}</>}
        </div>
    </>
}

export default MyCards
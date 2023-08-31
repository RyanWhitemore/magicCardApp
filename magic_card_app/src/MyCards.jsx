import axios from "axios"
import Card from "./Card"
import { useState, useEffect} from "react"
import { Link } from "react-router-dom"


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
        <Link to="/">Back</Link>
        {mycards && <>{mycards.map((card) => {
            return <Card 
                withButton={false} 
                card={card}
                withDeleteButton={true}/>
        })}</>}
    </>
}

export default MyCards
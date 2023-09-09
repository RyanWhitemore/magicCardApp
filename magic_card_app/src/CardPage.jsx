import Card from "./Card"
import { Link, useLocation } from "react-router-dom"
import "./CardPage.css"
import Header from "./Header"

const CardPage = () => {
    

    const location = useLocation()
    const { card, fromMyCards, cards } = location.state
    console.log(card)

    return <>
        <Header fromHome={false}/>
        <div id="main">
            <Card
                cards={cards}
                fromCardPage={true} 
                card={card}
                withButton={true}
                fromMyCards={fromMyCards}
            />
        </div>
        
    </>
}


export default CardPage
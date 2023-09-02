import Card from "./Card"
import { Link, useLocation } from "react-router-dom"
import "./CardPage.css"

const CardPage = () => {
    
    const location = useLocation()
    const { card, fromMyCards, cards } = location.state

    return <>
        <header className="header">
            <div className="section">
                <Link id="mycards" to="/mycards">My Cards</Link>
            </div>
        </header>
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
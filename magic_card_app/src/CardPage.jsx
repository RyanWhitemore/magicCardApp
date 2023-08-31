import Card from "./Card"
import { Link, useLocation } from "react-router-dom"
import "./CardPage.css"

const CardPage = () => {
    
    const location = useLocation()
    const { card } = location.state

    return <>
        <header className="header">
            <div className="section">
                <Link id="mycards" to="/mycards">My Cards</Link>
            </div>
        </header>
        <div id="main">
            <Card
                fromCardPage={true} 
                card={card}
                withButton={true}
            />
        </div>
        
    </>
}


export default CardPage
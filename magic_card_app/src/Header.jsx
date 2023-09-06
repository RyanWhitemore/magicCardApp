import { Link } from "react-router-dom"
import "./header.css"

const Header = ({fromHome, loginClicked, setLoginClicked}) => {

    const refreshPage = (fromHome) => {
        if (fromHome) {
            window.location.reload()
        }
    }

    const logout = () => {
        localStorage.setItem("userID", "guest")
        window.location.reload()
    }

    return <>
        <header className="header">
            <div className="container">
                <div className="section">
                    <Link id="home" to="/" onClick={() => {refreshPage(fromHome)}} state={{cards: null}}>Home</Link>
                </div>
                <div className="section-2">
                    <Link id="mycards" to="/mycards">My Cards</Link>
                </div>
                <div className="section-3">
                    <Link className="link" to="/deckbuilder">Deck Builder</Link>
                </div>
                {localStorage.getItem("userID") === "guest" && <div className="login">
                    <button className={"login-button"} onClick={() => {setLoginClicked(!loginClicked);}}>Login</button>
                    <Link id="register" to="/register">Register</Link>
                </div>}
                {localStorage.getItem("userID") !== "guest" && <div className="logout-button">
                    <button className={"logout-button"}onClick={logout}>Logout</button>
                </div>}
            </div>
        </header>
    </>
}

export default Header
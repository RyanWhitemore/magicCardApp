import { Link } from "react-router-dom"

const Header = ({fromHome, loginClicked, setLoginClicked}) => {

    const refreshPage = (fromHome) => {
        if (fromHome) {
            window.location.reload()
        }
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
                <div className="login">
                    <button className={"login-button"} onClick={() => {setLoginClicked(!loginClicked);}}>Login</button>
                </div>
            </div>
        </header>
    </>
}

export default Header
import { Link } from "react-router-dom"
import styles from "./header.module.css"
import axios from "axios"

const Header = ({
        fromHome, 
        loginClicked, 
        setLoginClicked,
        search,
        setSearch,
        setDefaultCards,
        setCards,
        suggestions,
        setSuggestions

    }) => {

    const searchByName = async (e) => {
        try {
            setDefaultCards(null)
            const results = await axios.get("https://api.scryfall.com/cards/search?q=" + search )
            setCards(results.data.data)
        } catch (err) {
            return <>
                <form onSubmit={(e) => {e.preventDefault(); searchByName(e)}}>
                    <input type="text" placeholder="Search" value={search}
                    onChange={handleChange}/>
                    <button>Search</button>
                </form>
            </>
        }
    }

    const handleChange = async (e) => {
        e.preventDefault()

        setSearch(e.target.value)

        const results = await axios.get("https://api.scryfall.com/cards/autocomplete?q=" + e.target.value)

        setSuggestions(results.data.data)
    }


    const logout = () => {
        localStorage.setItem("userID", "guest")
        window.location.reload()
    }

    return <>
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.section}>
                    <Link className={styles.home} to="/" >Home</Link>
                </div>
                <div className={styles.section2}>
                    <Link className={styles.mycards} to="/mycards">My Cards</Link>
                </div>
                <div className={styles.section3}>
                    <Link className={styles.link} to="/deckbuilder">Deck Builder</Link>
                </div>
                {localStorage.getItem("userID") === "guest" && <div className="login">
                    <button className={styles.loginbutton} onClick={() => {setLoginClicked(!loginClicked);}}>Login</button>
                    <Link className={styles.register} to="/register">Register</Link>
                </div>}
                {localStorage.getItem("userID") !== "guest" && <div className="logout-button">
                    <button className={styles.logoutbutton}onClick={logout}>Logout</button>
                </div>}
            </div>
            {fromHome && <form onSubmit={(e) => {e.preventDefault(); searchByName(e)}}>
                <input className={styles.search} list="suggestions" type="text" placeholder="Search" 
                value={search}
                onChange={handleChange}/>
                    <datalist id="suggestions">
                        {suggestions.map((item) => {
                            return <option>{item}</option>
                        })}
                    </datalist>
            </form>}
        </header>
    </>
}

export default Header
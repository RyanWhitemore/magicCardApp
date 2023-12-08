import { Link } from "react-router-dom"
import styles from "./header.module.css"
import axios from "axios"
import { useState } from "react"

const Header = ({
        fromHome, 
        loginClicked, 
        setLoginClicked,
        setDefaultCards,
        setCards,
        collectionTotalPrice,
        setIsSearched,
        fromMyCards,
        setSortValue,
        username,
        password,
        setUsername,
        setPassword
    }) => {

    const user = localStorage.getItem("userID")

    const [ suggestions, setSuggestions ] = useState([])

    const [ search, setSearch ] = useState("")

    

    const searchByName = async (e) => {
        try {
            setDefaultCards(null)
            const results = await axios.get("https://api.scryfall.com/cards/search?q=" + search )
            const collectionResults = await axios.get("http://localhost:5000/getcards/" + user)
            for (const result of results.data.data) {
                for (let i = 0; i < collectionResults.data.length; i++) {
                    if (collectionResults.data[i].id === result.id) {
                        result.inCollection = true
                    }
                }
            }
            setIsSearched(true)
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

    const searchMyCards = async (e) => {
        try {
            const results = await axios.get("http://localhost:5000/myCards/" + user + "/" + search)

            setCards({data: [results.data]})
            setIsSearched(true)
        } catch (err) {
            console.log(err)
            return <>
                <form onSubmit={(e) => {e.preventDefault(); searchMyCards(e)}}>
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
        localStorage.setItem("chosenColors", "all")
        localStorage.setItem("commander", JSON.stringify(false))
        localStorage.setItem("deck", JSON.stringify([]))
        localStorage.setItem("notChosenColors", JSON.stringify({data: ['G', "R", "B", "U", "W"]}))
        localStorage.setItem("deckCost", JSON.stringify(0.00))
        window.location.reload()
    }

    const sort = (e) => {
        setSortValue(e.target.value)
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
                <div className={styles.section4}>
                    <select id={"sort options"}onChange={sort}>
                        <option value={"name"} defaultValue>Name</option>
                        <option value={"color"}>Color</option>
                        <option value={"value"}>Value</option>
                    </select>
                </div>
                {collectionTotalPrice > 0 ? <div className={styles.section5}>
                    Total Value: ${collectionTotalPrice}
                </div> : null}
            </div>
            {fromHome && <form onSubmit={(e) => {e.preventDefault(); searchByName(e)}}>
                <input id={"search bar"}className={styles.search} list="suggestions" type="text" placeholder="Search" 
                value={search}
                onChange={handleChange}/>
                    <datalist id="suggestions">
                        {suggestions.map((item) => {
                            return <option>{item}</option>
                        })}
                    </datalist>
            </form>}
            {fromMyCards && <form onSubmit={(e) => {e.preventDefault(); searchMyCards(e)}}>
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
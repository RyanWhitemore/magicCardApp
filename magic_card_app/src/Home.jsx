import {React, useState} from "react";
import axios from "axios";
import Card from "./Card";
import Header from "./Header";
import Popup from "reactjs-popup";
import styles from "./Home.module.css"
import { useQuery } from "react-query";



const Home = ({  
        fromDeckBuilder, 
        addedCards, 
        setAddedCards,
        deckCost,
        setDeckCost,
        chosenDeckType,
        setChosenDeckType,
        chosenColors,
        notChosenColors,
        setCommander,
        setIsCommander,
        isCommander }) => {

    const User = localStorage.getItem("userID")

    const [ loginClicked, setLoginClicked ] = useState(false)

    const [ defaultCards, setDefaultCards ] = useState(false)

    const [ cards, setCards ] = useState([])

    const [ sortValue, setSortValue ] = useState("name")

    const [isCards, setIsCards] = useState(false)

    const [ isSearched, setIsSearched ] = useState(false)

    const [ username, setUsername ] = useState("")

    const [ password, setPassword ] = useState("")

    let {status, data, error, isFetching} = useQuery({queryKey: ["defaultCards", User], refetchOnWindowFocus: false, queryFn: () => {
        if (fromDeckBuilder & !isSearched) {
            if (User !=="guest") {
                setIsCards(true)
                return axios.get("http://localhost:5000/getCards/" + User)
            }
        } else {
            if (User !=="guest" & !isSearched) {
                setIsCards(true)
                return axios.get("http://localhost:5000/getCards/" + User)
            } else {
                return axios.get("https://api.scryfall.com/sets/aer")
            }
        }
        
    }})

    if (sortValue === "name") {
        if (data) {
            data = data.data.sort((a, b) => {
                return a.name.localeCompare(b.name)
            })
        }
    }

    if (sortValue === "value") {
        if (data) {
            data = data.data.sort((a, b) => {
                if (a.prices.usd === null | b.prices.usd === null) {
                    return false
                }
                return b.prices.usd - a.prices.usd
            })
        }
    }
    
    if (sortValue === "color") {
        if (data) {
            data = data.data.sort((a, b) => {
                
                a = a.color_identity.join()
                b = b.color_identity.join()

                return b.localeCompare(a)

            })
        }
    }
    
    if (chosenColors && chosenColors !== "all") {
        if (data && chosenColors.length > 0) {
            data = data.filter((card) => {
                if (card.color_identity.length === 0) {
                    return true
                }
                for (const color of notChosenColors) {
                    if (card.color_identity.indexOf(color) >= 0) {
                        return false
                    }
                }
                return true
            })
        }
    }

    const setInfo = data?.data

    const defaultSet = useQuery({queryKey: ["defaultSet", User], queryFn: () => {
        if (setInfo.data) {
            if (setInfo.data.search_uri) {
                setDefaultCards(true)
                return axios.get(setInfo.data.search_uri)
            }
        } else {
            return null
        }
       
    }, enabled: !!setInfo})

    if (defaultSet.error) {
        console.log(defaultSet.error.message)
    }
    
    const changePassword = (e) => {
        e.preventDefault()

        setPassword(e.target.value)
    }

    const changeUsername = (e) => {
        e.preventDefault()

        setUsername(e.target.value)
    }

    const login = async (e) => {
        e.preventDefault()
        const results = await axios.post("http://localhost:5000/login", {
            username: username.toLowerCase(), password: password
        })

        if (!results.data.message) {
            setIsCards(true)
            setDefaultCards(false)
            localStorage.setItem("userID", results.data)
            setLoginClicked(!loginClicked)
        } else {
            console.log("login failed")
        }
        
    }
    

    return <>
    <Popup 
        open={loginClicked} 
        modal
        nested    
    > 
        {close => (
            <div className="modal">
                <div className={styles.header}>Login</div>
                <button className={styles.close} onClick={() => {close(); setLoginClicked(!loginClicked)}}>
                    &times;
                </button>
                <div className={styles.content}>
                    <form onSubmit={login}>
                        <div className={styles.username}>
                            <input 
                                type="text" 
                                onChange={changeUsername} 
                                placeholder="username">
                            </input>
                        </div>
                        <div className={styles.password}>
                            <input 
                                type="text" 
                                onChange={changePassword} 
                                placeholder="password">
                            </input>
                        </div>
                        <button className={styles.loginbutton} type="submit">Login</button>
                    </form>
                </div>

            </div>    
        )}
        
    </Popup>
    <Header 
        setLoginClicked={setLoginClicked}  
        loginClicked={loginClicked} 
        fromHome={true}
        defaultCards={defaultCards}
        setDefaultCards={setDefaultCards}
        cards={cards}
        setCards={setCards}
        setIsSearched={setIsSearched}
        setSortValue={setSortValue}
        sortValue={sortValue}/>
    <div id="main">
        {!isFetching & isCards & !isSearched ? <div className={styles.cards}>
            {data.map(card => {
                if (!chosenDeckType | card.legalities[chosenDeckType] === "legal") {
                    return <div key={card.id}>
                        <Card
                        cards={isCards}
                        withButton={true} 
                        card={card}
                        fromDeckBuilder={fromDeckBuilder}
                        addedCards={addedCards}
                        setAddedCards={setAddedCards}
                        deckCost={deckCost}
                        setDeckCost={setDeckCost}
                        chosenDeckType={chosenDeckType}
                        setChosenDeckType={setChosenDeckType}
                        setCommander={setCommander}
                        setIsCommander={setIsCommander}
                        isCommander={isCommander}
                        />
                    </div>
                } else {
                    return null
                }
                
            })}
            </div> : null}

        {isSearched ? <div className={styles.cards}>
            {cards.map(card => {
                if (!chosenDeckType | card.legalities[chosenDeckType] === "legal") {
                    return <div key={card.id}>
                        <Card
                        cards={isCards}
                        withButton={true} 
                        card={card}
                        fromDeckBuilder={fromDeckBuilder}
                        addedCards={addedCards}
                        setAddedCards={setAddedCards}
                        deckCost={deckCost}
                        setDeckCost={setDeckCost}
                        chosenDeckType={chosenDeckType}
                        setChosenDeckType={setChosenDeckType}
                        />
                    </div>
                } else {
                    return null
                }
                
            })}
            </div> : null}
        {!defaultSet.isLoading & defaultCards ? <div className={styles.cards}>
                {defaultSet.data.data.data.map(card => {
                    if (!chosenDeckType | card.legalities[chosenDeckType] === "legal") {
                        return <div key={card.id}>
                            <Card 
                            fromDeckBuilder={fromDeckBuilder}
                            addedCards={addedCards}
                            setAddedCards={setAddedCards}
                            card={card}
                            setDeckCost={setDeckCost}
                            deckCost={deckCost}
                            chosenDeckType={chosenDeckType}
                            setChosenDeckType={setChosenDeckType}
                            />
                        </div>
                    } else {
                        return null
                    }
                })}
            </div>: null}
        
    </div>
    </>
}

export default Home
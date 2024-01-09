import axios from "axios"
import { useQuery } from "react-query"
import Header from "./Header"
import styles from "./MyDecks.module.css"
import { useNavigate } from "react-router-dom"
import Popup from "reactjs-popup"
import { useState } from "react"


const MyDecks = ({
        login,
        defaultCards,
        setDefaultCards,
        setIsCards,
        isCards,
        loginClicked,
        setLoginClicked,
        username,
        password,
        setPassword,
        setUsername
}) => {

    const user = localStorage.getItem("userID")
    const [ deckName, setDeckName ] = useState(false)
    const [ notChosenColors, setNotChosenColors ] = useState(["W", "U", "B", "R", "G"])

    const typesOfDecks = ["commander",
        "modern","pauper","standard","future",
        "historic","gladiator","pioneer","explorer",
        "legacy","vintage","penny","oathbreaker",
        "brawl","historicbrawl","alchemy","paupercommander",
        "duel","oldschool","premodern","predh"]

    const colors = ["White", "Blue", "Black", "Red", "Green"]

    const colorsObj = {"White": "W", "Blue": "U", "Black": "B", "Red": "R", "Green": "G"}

    const deckList = useQuery({queryKey: "deckList" + user, refetchOnWindowFocus: false, queryFn: () => {
        return axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/deck/` + user)
    }})

    const defaultDeckName = "New Deck(" + (deckList.isFetched  && deckList.data.data? deckList.data.data.filter((deck) => {
        if (deck.deckName?.match(/[Deck Name]/)) {
            return true
        }
        return false
    }).length + ")": null)

    const navigate = useNavigate()

    const getDeck = async (deck) => {
        const deckToOpen = []
        for (const card of deck.cards) {
            let cardToAdd = axios.get(`https://api.scryfall.com/cards/${card.card}`)
            cardToAdd = await cardToAdd
            deckToOpen.push({card: cardToAdd.data, numInDeck: card.numInDeck})
        }
        return deckToOpen
    }

    const getCommander = async (commander) => {
        const commanderToAdd = await axios.get(`https://api.scryfall.com/cards/${commander}`)
        return commanderToAdd
    }

    const setUpDeck = (deck, deckToOpen, commander) => {
        try {
            localStorage.setItem("deck", JSON.stringify(deckToOpen))
            if(commander) {
                localStorage.setItem("commander", JSON.stringify(commander.data))
            } else {
                localStorage.setItem("commander", JSON.stringify(false))
            }
            localStorage.setItem("deckID", deck.deckID)
            localStorage.setItem("deckName", deck.deckName)
            localStorage.setItem("deckType", deck.deckType)
            localStorage.setItem('deckColorIdentity', JSON.stringify(deck.colorIdentity))
            return true
        } catch (err) {
            console.log(err)
        }
    }

    const openDeck = async (deck) => {
        const deckToOpen = await getDeck(deck)

        let commander = false

        if (deck.commander) {
            commander = await getCommander(deck.commander)
        }

        if (setUpDeck(deck, deckToOpen, commander)) {
            return navigate("/deckpage")
        }
    }

    const createDeckID = () => {
        const chars = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ1234567890'

        let deckID = ''

        for (let i = 0; i < 20; i++) {
            const charIndex = Math.floor(Math.random() * chars.length)
            deckID = deckID + chars[charIndex]
        }
        return deckID
    }

    const handleColorChange = (e) => {
        let currentNotChosenColors = notChosenColors

        if (e.target.checked) {
            if (currentNotChosenColors.length === 0) {
                currentNotChosenColors = notChosenColors.filter((color) => {
                    if (color === e.target.value) {
                        return true
                    } else {
                        return false
                    }
                })
                setNotChosenColors(currentNotChosenColors)
            } else {
                currentNotChosenColors = notChosenColors.filter((color) => {
                    if (color === e.target.value) {
                        return false
                    } else {
                        return true
                    }
                    
                })
                setNotChosenColors(currentNotChosenColors)
            }
        } else {
            currentNotChosenColors.push(e.target.value)
            setNotChosenColors(currentNotChosenColors)
        }

        
    }

    const createDeck = () => {
        console.log("called")
        const deckID = createDeckID()

        localStorage.setItem("deckID", deckID)
        localStorage.setItem("deck", JSON.stringify([]))
        localStorage.setItem("commander", JSON.stringify(false))
        if (deckName) {
            localStorage.setItem("deckName", deckName)
        } else {
            localStorage.setItem("deckName", defaultDeckName)
        }
        localStorage.setItem("notChosenColors", JSON.stringify({data: notChosenColors}))

        navigate("/deckbuilder")
    }

    return <>
    <Header setLoginClicked={setLoginClicked}
        loginClicked={loginClicked}
        fromHome={false}
        login={login}
        setUsername={setUsername}
        setPassword={setPassword}
        />
    <div className={styles.main}>
        <Popup trigger={<div className={styles.create}>
            <button>Create Deck</button>
            </div>} modal>
            <div className={styles.creationMenu}>
                <input onChange={(e) => setDeckName(e.target.value)} 
                    className={styles.deckName}
                    defaultValue={defaultDeckName}
                ></input>
                <div className={styles.typeLabel}>
                    <label htmlFor="types">Deck Type</label>
                </div>
                <div id="types" className={styles.typeMenu}>
                    <select className={styles.dropdown}
                        onChange={(e) => localStorage.setItem("deckType", e.target.value)}
                    >
                        {typesOfDecks.map((type) => {
                            return <option value={type}>{type}</option>
                        })}
                    </select>
                </div>
                <div className={styles.colorLabel}>
                    <label htmlFor="colors">Deck Colors</label>
                </div>
                <div id="colors" className={styles.colorMenu}>
                    {colors.map(color => {
                        return <div className={styles.check}>
                            <input onChange={handleColorChange} id={color} type="checkbox" value={colorsObj[color]}/>
                            <label htmlFor={color}>{color}</label>
                        </div>
                    })}
                </div>
                <button className={styles.createButton} onClick={createDeck}>Create Deck</button>
            </div>
        </Popup>
        <header className={styles.header}>Decks</header>
        <div className={styles.decksDiv}>
            {deckList.isFetched && deckList.data.data ? deckList.data.data.map(deck => {
                    return <><div className={styles.deckDiv} onClick={() => {
                        openDeck(deck)
                    }}>
                                    {deck.deckName}{deck?.colorIdentity?.map(color => {
                                return <img alt={color}
                                    src={`${color}Pip.png`}
                                    height={"13px"}
                                    width={"13px"}
                                    className={styles.pips}
                                ></img>
                            })}
                        </div></>
                }) : null}
        </div>
    </div>
    </> 
}

export default MyDecks
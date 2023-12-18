import Home from "./Home"
import styles from "./DeckBuilder.module.css"
import { useEffect, useState, useRef } from "react"
import Card from "./Card"
import { useQuery } from "react-query"
import axios from "axios"
import Popup from "reactjs-popup"
import CardInDeck from "./CardInDeck"
import useOutsideAlerter from "./util"

const DeckBuilder = ({
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
    }
) => {

    const [ addedCards, setAddedCards ] = useState(JSON.parse(localStorage.getItem("deck")).length > 0 ? JSON.parse(localStorage.getItem("deck") ) : [])

    const [ chosenColors, setChosenColors ] = useState(localStorage.getItem("chosenColors"))

    const [ notChosenColors, setNotChosenColors ] = useState( localStorage.getItem("notChosenColors") ? JSON.parse(localStorage.getItem("notChosenColors")).data : ["R", "U", "B", "G", "W"])

    const [ commander, setCommander] = useState(JSON.parse(localStorage.getItem("commander")))

    const [ isCommander, setIsCommander ] = useState(false)

    const [ chosenDeckType, setChosenDeckType ] = useState("commander")

    const [ deckCost, setDeckCost ] = useState(localStorage.getItem("deckCost") > 0 ? JSON.parse(localStorage.getItem("deckCost")) : 0.00)

    const [ creatingDeck, setCreatingDeck ] = useState(false)

    const [ editingDeck, setEditingDeck ] = useState(false)

    const [ namingDeck, setNamingDeck ] = useState(false)

    const [ deckName, setDeckName ] = useState(localStorage.getItem("deckName"))

    const user = localStorage.getItem("userID")

    const localCommander = localStorage.getItem("commander")

    const localIsCommander = localStorage.getItem("isCommander")

    const nameRef = useRef(null)

    const editRef = useRef(null)

    useOutsideAlerter(editRef, setEditingDeck)

    useOutsideAlerter(nameRef, setNamingDeck)

    const deckID = localStorage.getItem("deckID")

    let numberOfType = 0

    const cardTypes = ["Artifact", "Instant", "Creature", 
        "Enchantment", "Sorcery", "Land", "Basic Land", "Planeswalker",
        "Battle"
        ]
       
    useEffect(() => {
        if (localStorage.getItem("commander")) {
            setCommander(JSON.parse(localStorage.getItem("commander")))
        }
    }, [localCommander])

    useEffect(() => {
        if (localStorage.getItem("isCommander")) {
            setIsCommander(JSON.parse(localStorage.getItem("isCommander")))
        }
    }, [localIsCommander])

    const typesOfDecks = ["commander",
        "modern","pauper","standard","future",
        "historic","gladiator","pioneer","explorer",
        "legacy","vintage","penny","oathbreaker",
        "brawl","historicbrawl","alchemy","paupercommander",
        "duel","oldschool","premodern","predh"]
   
    
    const {data, isFetched} = useQuery({queryKey: "ownedCards", refetchOnWindowFocus: false, queryFn: () => {
        return axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/getCards/` + user)
    }})

    if (isFetched) {
        for (const card of addedCards) {
            if (data.data.indexOf(card)) {
                card.inCollection = true
            }
        }
    }

    const deckList = useQuery({queryKey: "deckList" + user, refetchOnWindowFocus: false, queryFn: () => {
        return axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/deck/` + user)
    }})


    const createDeckID = () => {
        const chars = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ1234567890'

        let deckID = ''

        for (let i = 0; i < 20; i++) {
            const charIndex = Math.floor(Math.random() * chars.length)
            deckID = deckID + chars[charIndex]
        }
        return deckID
    }

    const saveDeck = () => {
        const deck = []
        const colorIdentity = []
        const addedColors = []
        const colors = {
            W: "white", U: "blue", B: "black",
            R: "red", G: "green"
        }
        if (chosenDeckType === "commander") {
            for (const color of commander.color_identity) {
                if (addedColors.indexOf(color) < 0) {
                    addedColors.push(color)
                    colorIdentity.push(colors[color])
                }
            }
        }
        for (const card of addedCards) {
            if (chosenDeckType !== "commander") {
                for (const color of card.color_identity) {
                    if (addedCards.indexOf(color) < 0) {
                        console.log(color)
                        colorIdentity.push(colors[color])
                    }
                }
            }
            deck.push({card: card.card.id, numInDeck: card.numInDeck})
        }
        axios.put(`http://localhost:${process.env.REACT_APP_SERVPORT}/deck`, {
            deckType: chosenDeckType,
            deckName: deckName,
            commanderID: commander ? commander.id : null, 
            userID: user,
            deckID: localStorage.getItem("deckID"),
            cards: deck,
            colorIdentity: colorIdentity
        })
    }

    const openDeck = async (deck) => {
        const deckToOpen = []

        for (const card of deck.cards) {
            const cardToAdd = await axios.get("https://api.scryfall.com/cards/" + card)
            deckToOpen.push({card: cardToAdd.data, numInDeck: card.numInDeck})
        }
        setAddedCards(deckToOpen)
        if (deck.commander) {
            const commanderToOpen = await axios.get("https://api.scryfall.com/cards/" + deck.commander)
            setCommander(commanderToOpen.data)
        }
        setCreatingDeck(true)
        setEditingDeck(false)
        localStorage.setItem("deckID", deck.deckID)
        console.log(deck.deckID)
    }

    const handleChecks = (e) => {
        if (e.target.checked) {
            if (chosenColors === "all") {
                setChosenColors(e.target.value)
                localStorage.setItem("chosenColors", JSON.stringify(e.target.value))
            }
            console.log(notChosenColors)
            const notColors = notChosenColors.filter(color => {
                if (color === e.target.value) {
                    return false
                }
                return true
            })
            setNotChosenColors(notColors)
            localStorage.setItem("notChosenColors",JSON.stringify({ data: notColors }))
            
        }
        if (!e.target.checked) {
            if (notChosenColors.length === 0) {
                setNotChosenColors([e.target.value])
                localStorage.setItem("notChosenColors", JSON.stringify({data: [e.target.value]}))
            } else {
                const notColors = notChosenColors
                console.log(notColors)
                notColors.push(e.target.value)
                console.log(notColors)
                localStorage.setItem("notChosenColors", JSON.stringify({data: notColors}))
                setNotChosenColors(JSON.parse(localStorage.getItem("notChosenColors")).data)
            }
        }
    }

    useEffect(() => {
        if (JSON.parse(localStorage.getItem("deck")).length > 0) {
            if (chosenColors !== "all") {
                localStorage.setItem("deck", JSON.stringify(JSON.parse(localStorage.getItem("deck")).filter(card => {
                    for (const color of notChosenColors) { 
                        if (card.color_identity.indexOf(color) >= 0) {
                            let newDeckCost = parseFloat(JSON.parse(localStorage.getItem("deckCost")))
                            newDeckCost = newDeckCost - parseFloat(card.prices.usd)
                            newDeckCost = newDeckCost.toFixed(2)
                            localStorage.setItem("deckCost", JSON.stringify(newDeckCost))
                            setDeckCost(JSON.parse(localStorage.getItem("deckCost")))
                            return false
                        }
                    }
                    return true
                })))
            }
            setAddedCards(JSON.parse(localStorage.getItem("deck")))
        }
    }, [notChosenColors, chosenColors])
    
    const handleChange = (e) => {
        setChosenDeckType(e.target.value)
    }

    return <>
        <div className={styles.flexcontainer}>
            <div className={styles.homediv}>
                <Home 
                fromDeckBuilder={true}
                addedCards={addedCards}
                setAddedCards={setAddedCards}
                deckCost={deckCost}
                setDeckCost={setDeckCost}
                chosenDeckType={chosenDeckType}
                chosenColors={chosenColors}
                notChosenColors={notChosenColors}
                setCommander={setCommander}
                commander={commander}
                setIsCommander={setIsCommander}
                isCommander={isCommander}
                setNotChosenColors={setNotChosenColors}
                setChosenColors={setChosenColors}
                withoutButton={true}
                login={login}
                defaultCards={defaultCards}
                setDefaultCards={setDefaultCards}
                setIsCards={setIsCards}
                isCards={isCards}
                loginClicked={loginClicked}
                setLoginClicked={setLoginClicked}
                username={username}
                password={password}
                setPassword={setPassword}
                setUsername={setUsername}
                />
            </div>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.section2}>
                        <label htmlFor="deckTypes">Deck Types:</label>
                        <select defaultValue={"commander"} id="deckTypes" onChange={handleChange}>
                            {typesOfDecks.map((key) =>{
                                return <>
                                       <option value={key}>{key}</option>
                                </>
                            })}
                        </select>
                        
                    </div> 
                    <div className={styles.deckCost}>
                        {"Cost of Deck: $" + deckCost.toString()}
                    </div>
                    <div className={styles.dropdown}>
                        <input onChange={handleChecks} 
                        type="checkbox" id="red" value={"R"} checked={notChosenColors.indexOf("R") < 0}/>                        
                        <label htmlFor="red">Red</label>
                        <input onChange={handleChecks} 
                        type="checkbox" id="blue" value={"U"} checked={notChosenColors.indexOf("U") < 0}/>
                        <label htmlFor="blue">Blue</label>
                        <input onChange={handleChecks} 
                        type="checkbox" id="black" value={"B"} checked={notChosenColors.indexOf("B") < 0}/>                        
                        <label htmlFor="black">Black</label>
                        <input onChange={handleChecks} 
                        type="checkbox" id="green" value={"G"} checked={notChosenColors.indexOf("G") < 0}/>
                        <label htmlFor="green">Green</label>
                        <input onChange={handleChecks} 
                        type="checkbox" id="white" value={"W"} checked={notChosenColors.indexOf("W") < 0}/>
                        <label htmlFor="white">White</label>
                    </div>
                    <button className={styles.save} onClick={saveDeck}>Save deck</button>  
                </header>
                <div className={styles.body}>
                {chosenDeckType === "commander" ? <header className={styles.type}>Commander</header> : null}
                {commander ? <div className={styles.commanderDiv}>
                    <Card
                        className={styles.commander}
                        card={commander}
                        inDeck={true}
                        deckCost={deckCost}
                        setDeckCost={setDeckCost}
                        chosenDeckType={chosenDeckType}
                        isCommander={isCommander}
                        setCommander={setCommander}
                        setNotChosenColors={setNotChosenColors}
                        setChosenColors={setChosenColors}
                        withoutButton={true}
                    />
                    </div>: null}
                <div className={styles.addedCards}>
                    {localStorage.getItem("userID") !== "guest" && <Popup open={editingDeck}>{deckList.data?.data?.map((deck) => {
                        return <button ref={editRef} onClick={() => {openDeck(deck)}}>{deck.deckName}</button>
                    })}</Popup>}
                    <Popup open={namingDeck}
                        ><div ref={nameRef} className={styles.popupDiv}>
                            <input defaultValue={"New Deck(" + (deckList.isFetched  && deckList.data.data? deckList.data.data.filter((deck) => {
                                if (deck.deckName?.match(/[Deck Name]/)) {
                                    return true
                                }
                                return false
                            }).length + 1 + ")": null)} onInput={e => setDeckName(e.target.value)}></input>
                            <button onClick={(e) => {
                                console.log(deckName)
                                setCreatingDeck(true);
                                const deckID = createDeckID(); 
                                localStorage.setItem("deckID", 
                                    JSON.stringify(deckID));
                                setNamingDeck(false);
                                setAddedCards([])
                                setCommander(false)
                                localStorage.setItem("commander", JSON.stringify(false))
                                localStorage.setItem("deck", JSON.stringify([]))
                            }}>Submit</button>
                        </div></Popup>
                        {cardTypes.map((type) => {
                            let numOfType = addedCards.reduce((sum, card) => {
                                if (card.card.type_line.indexOf(type) >= 0) {
                                    sum += 1
                                    return sum
                                }
                                return sum
                            }, 0)
                        return <div key={type} className={styles.typeDiv} style={{
                           
                        }}>
                            <header className={styles.type}>{type} ({numOfType})</header>
                            {addedCards.map((card) => {
                                const addedTypes = []
                                for (const typeToAdd of cardTypes) {
                                    if (card.card.type_line.indexOf(typeToAdd) >= 0) {
                                        addedTypes.push(typeToAdd)
                                    }
                                }
                                const mana_array = card.card.mana_cost.replace(/[}]/g, "").split("{")
                                let finalType = null
                                if (addedTypes.length > 1 & addedTypes[1] === type) {
                                    finalType = addedTypes[1]
                                } else {
                                    finalType = type
                                }
                                if (card.card.type_line.indexOf(finalType) >= 0) {
                                    numOfType += 1

                                    return <>
                                        <div className={styles.cardDiv} key={card.card.card_id}>
                                            <CardInDeck
                                                fromBuilder={true}
                                                setAddedCards={setAddedCards}
                                                addedCards={addedCards}
                                                mana_array={mana_array}
                                                card={card}
                                                deckCost={deckCost}
                                                setDeckCost={setDeckCost}
                                            />
                                        </div>
                                    </>
                                }
                                return null
                            })}
                        </div>
                    })}
                </div>
            </div>
            </div>
        </div>
        
    </>
}

export default DeckBuilder
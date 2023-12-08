import Home from "./Home"
import styles from "./DeckBuilder.module.css"
import { useEffect, useState } from "react"
import Card from "./Card"
import { useQuery } from "react-query"
import axios from "axios"
import Popup from "reactjs-popup"
import CardInDeck from "./CardInDeck"

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

    const user = localStorage.getItem("userID")

    const localCommander = localStorage.getItem("commander")

    const localIsCommander = localStorage.getItem("isCommander")

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
        return axios.get("http://localhost:5000/getCards/" + user)
    }})

    if (isFetched) {
        if (typeof addedCards !== "string")
        for (const card of addedCards) {
            if (data.data.indexOf(card)) {
                card.inCollection = true
            }
        }
    }

    const deckList = useQuery({queryKey: "deckList" + user, refetchOnWindowFocus: false, queryFn: () => {
        return axios.get("http://localhost:5000/deck/" + user)
    }})

    const saveDeck = async () => {
        const deckList = await axios.get("http://localhost:5000/deck/" + user)
        const deck = []
        for (const card of addedCards) {
            deck.push(card.id)
        }
        if (deckList.data.length === 0) {
            axios.put("http://localhost:5000/deck", {
                commanderID: commander ? commander.id : null, 
                userID: user,
                deckID: 1,
                cards: deck
            })
        }
    }

    const openDeck = async (deck) => {
        const deckToOpen = []

        for (const card of deck.cards) {
            const cardToAdd = await axios.get("https://api.scryfall.com/cards/" + card)
            deckToOpen.push(cardToAdd.data)
        }
        setAddedCards(deckToOpen) 
        const commanderToOpen = await axios.get("https://api.scryfall.com/cards/" + deck.commander)
        setCommander(commanderToOpen.data)
        setCreatingDeck(true)
        setEditingDeck(false)
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
                console.log(chosenColors)
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
                {chosenDeckType === "commander" && creatingDeck ? <header className={styles.type}>Commander</header> : null}
                {commander && creatingDeck ? <div className={styles.commanderDiv}>
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
                        return <button onClick={() => {openDeck(deck)}}>{deck.deckID}</button>
                    })}</Popup>}
                    {creatingDeck ? cardTypes.map((type) => {
                        let numOfType = addedCards.reduce((sum, card) => {
                            if (card.type_line.indexOf(type) >= 0) {
                                sum += 1
                                return sum
                            }
                            return sum
                        }, 0)
                        return <div key={type} className={styles.typeDiv} style={{
                            height: numOfType === 1 ? 255 : numOfType * 185 
                        }}>
                            <header className={styles.type}>{type}</header>
                            {addedCards.map((card) => {
                                if (card.type_line.indexOf(type) >= 0) {
                                    if (card.type_line.indexOf(type) >= 0) {
                                        numberOfType += 1
                                    }
                                    return <>
                                        <div className={styles.cardDiv} key={card.card_id}>
                                            <Card 
                                                numberOfType={numberOfType}
                                                card={card} 
                                                inDeck={true}
                                                addedCards={addedCards}
                                                setAddedCards={setAddedCards}
                                                deckCost={deckCost}
                                                setDeckCost={setDeckCost}
                                                chosenDeckType={chosenDeckType}
                                                withoutButton={true}
                                            />
                                        </div>
                                    </>
                                }
                                return null
                            })}
                        </div>
                    }): <>
                            <button onClick={() => {
                            setCreatingDeck(true); 
                            localStorage.setItem("deckID", 
                                JSON.stringify(deckList.data.data.length))
                            }}>Create Deck</button>
                            <button onClick={() => setEditingDeck(true)}>Edit Deck</button>
                        </>
                        }
                     {creatingDeck ? <button onClick={() => {
                        setCreatingDeck(false); 
                        localStorage.setItem("deckID", JSON.stringify(null))}}
                        >Cancel</button> : null}
                </div>
            </div>
            
        </div>
        
    </>
}

export default DeckBuilder
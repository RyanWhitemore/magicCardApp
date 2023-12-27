import Home from "./Home"
import styles from "./DeckBuilder.module.css"
import { useEffect, useState, useRef } from "react"
import Card from "./Card"
import { useQuery } from "react-query"
import axios from "axios"
import CardInDeck from "./CardInDeck"
import { useOutsideAlerter } from "./util"
import Graph from "./Graph"
import Popup from "reactjs-popup"

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

    const [ chosenDeckType, setChosenDeckType ] = useState(localStorage.getItem("deckType"))

    const [ deckCost, setDeckCost ] = useState(JSON.parse(localStorage.getItem("deckCost")) > 0 ? JSON.parse(localStorage.getItem("deckCost")) : 0.00)

    const [ deckName, setDeckName ] = useState(localStorage.getItem("deckName"))
    
    const [ editable, setEditable] = useState(false)

    const [ handPopup, setHandPopup ] = useState(false)

    const [ sampleHand, setSampleHand ] = useState([])

    const [ cardToAdd, setCardToAdd ] = useState({})

    const user = localStorage.getItem("userID")

    const localCommander = localStorage.getItem("commander")

    const localIsCommander = localStorage.getItem("isCommander")

    const handRef = useRef(null)

    const nameRef = useRef(null)

    useOutsideAlerter(nameRef, setEditable)

    useOutsideAlerter(handRef, setHandPopup)

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

    const saveDeck = () => {
        const deck = []
        const colorIdentity = []
        const addedColors = []
        const colors = {
            W: "white", U: "blue", B: "black",
            R: "red", G: "green"
        }
        if (chosenDeckType === "commander") {
            if (commander) {
                for (const color of commander.color_identity) {
                    if (addedColors.indexOf(color) < 0) {
                        addedColors.push(color)
                        colorIdentity.push(colors[color])
                    }
                }
            }
        }
        for (const card of addedCards) {
            if (chosenDeckType !== "commander") {
                for (const color of card.card.color_identity) {
                    if (addedCards.indexOf(color) < 0) {
                        console.log(color)
                        if (colorIdentity.indexOf(colors[color]) >= 0) {
                            break
                        }
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

    const handleChecks = (e) => {
        if (e.target.checked) {
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
                notColors.push(e.target.value)
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
                        if (card.card.color_identity.indexOf(color) >= 0) {
                            if (card.prices?.usd) {
                                let newDeckCost = parseFloat(JSON.parse(localStorage.getItem("deckCost")))
                                newDeckCost = newDeckCost - parseFloat(card.card.prices.usd)
                                newDeckCost = newDeckCost.toFixed(2)
                                localStorage.setItem("deckCost", JSON.stringify(newDeckCost))
                                setDeckCost(JSON.parse(localStorage.getItem("deckCost")))
                                }
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
        localStorage.setItem("deckType", e.target.value)
    }

    const getDeckSum = () => {
        let sum = 0
        for (const card of addedCards) {
            sum += card.numInDeck
        }
        return sum
    }

    
    const drawSampleHand = () => {
        const newSampleHand = []
        const cardNames = []

        for (const card of addedCards) {
            for (let i = 0; i < card.numInDeck; i++) {
                let tempObj = {}
                tempObj.card = card
                cardNames.push(tempObj)
            }
        }

        for (let i = 0; i < 7; i++) {
            let index = Math.ceil(Math.random() * cardNames.length)
            let newCardToAdd = cardNames[index].card
            if (newSampleHand.indexOf(newCardToAdd) < 0) {
                newSampleHand.push(newCardToAdd)
            } else {
                let index = Math.ceil(Math.random() * cardNames.length)
                let newCardToAdd = cardNames[index].card
                newSampleHand.push(newCardToAdd)
            }
        }

        setSampleHand(newSampleHand)
        setHandPopup(true)
       
}

    return <>
        <div className={styles.flexcontainer}>
            <Popup open={handPopup}
            modal><div ref={handRef} className={styles.hand}>
                {sampleHand.map(card => {
                    return <Card card={card.card}
                    withoutButton={true}/>
                })}
            </div>
            </Popup>
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
                        <select defaultValue={chosenDeckType} id="deckTypes" onChange={handleChange}>
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
                    <button className={styles.sample} onClick={drawSampleHand}>Sample Hand</button>
                </header>
                <div className={styles.body}>
                    <div className={styles.subheader}>
                        {editable ? <div className={styles.deckName}>
                            <input 
                            type="text"
                            onChange={(e) => setDeckName(e.target.value)}
                            ref={nameRef}
                            className={styles.deckInput}
                            defaultValue={deckName}/>
                        </div> :
                    <header onDoubleClick={() => setEditable(true)}className={styles.deckName}>{deckName}</header>}
                    <header className={styles.deckCount}>
                    {getDeckSum()}/{chosenDeckType === "commander" ? 99 : 60}
                    </header>
                    {chosenDeckType === "commander" ? <header className={styles.type}>Commander</header> : null}
                        </div>
                    {commander ? <div className={styles.commanderDiv}>
                    <div className={styles.commanderImage}>
                        <Card
                            addedCards={addedCards}
                            setAddedCards={setAddedCards}
                            className={styles.commander}
                            card={commander}
                            inDeck={true}
                            deckCost={deckCost}
                            setDeckCost={setDeckCost}
                            chosenDeckType={chosenDeckType}
                            isCommander={true}
                            setCommander={setCommander}
                            setNotChosenColors={setNotChosenColors}
                            setChosenColors={setChosenColors}
                            withoutButton={true}
                        />
                    </div>
                    </div>: null}
                <div className={styles.graph}>
                    <Graph/>
                </div>
                <div className={styles.addedCards}>
                        {cardTypes.map((type) => {
                            let numOfType = addedCards.reduce((sum, card) => {
                                if (card.card.type_line.indexOf(type) >= 0) {
                                    sum += card.numInDeck
                                    return sum
                                }
                                return sum
                            }, 0)
                        return <div className={styles.typeFlex}>
                            <header className={styles.type}>{type} ({numOfType})</header>
                            <div key={type} className={styles.typeDiv}>
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
                                            <div className={styles.cardInDeckContainer} key={card.card.card_id}>
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
                        </div>
                    })}
                </div>
            </div>
            </div>
        </div>
    </>
}

export default DeckBuilder
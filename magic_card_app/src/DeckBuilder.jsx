import Home from "./Home"
import styles from "./DeckBuilder.module.css"
import { useEffect, useState } from "react"
import Card from "./Card"
import { useQuery } from "react-query"
import axios from "axios"

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

    const user = localStorage.getItem("userID")

    const localCommander = localStorage.getItem("commander")

    const localIsCommander = localStorage.getItem("isCommander")

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
   
    
    const {data, isFetching} = useQuery({queryKey: "ownedCards", refetchOnWindowFocus: false, queryFn: () => {
        return axios.get("http://localhost:5000/getCards/" + user)
    }})

    if (!isFetching) {
        if (typeof addedCards !== "string")
        for (const card of addedCards) {
            if (data.data.indexOf(card)) {
                card.inCollection = true
            }
        }
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
                        <select defaultValue={"commander"} name="deckTypes" onChange={handleChange}>
                            {typesOfDecks.map((key) =>{
                                return <>
                                       <option value={key}>{key}</option>
                                </>
                            })}
                        </select>
                        
                    </div> 
                    <div>
                        {"Cost of Deck: $" + deckCost.toString()}
                    </div>
                    <div>
                        <input onChange={handleChecks} 
                        type="checkbox" name="red" value={"R"} checked={notChosenColors.indexOf("R") < 0}/>                        
                        <label htmlFor="red">Red</label>
                        <input onChange={handleChecks} 
                        type="checkbox" name="blue" value={"U"} checked={notChosenColors.indexOf("U") < 0}/>
                        <label htmlFor="blue">Blue</label>
                        <input onChange={handleChecks} 
                        type="checkbox" name="black" value={"B"} checked={notChosenColors.indexOf("B") < 0}/>                        
                        <label htmlFor="black">Black</label>
                        <input onChange={handleChecks} 
                        type="checkbox" name="green" value={"G"} checked={notChosenColors.indexOf("G") < 0}/>
                        <label htmlFor="green">Green</label>
                        <input onChange={handleChecks} 
                        type="checkbox" name="white" value={"W"} checked={notChosenColors.indexOf("W") < 0}/>
                        <label htmlFor="white">White</label>
                    </div>  
                </header>
                {commander ? <Card
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
                /> : null}
                <div className={styles.addedCards}>
                    {addedCards.map((card) => {
                            return <div className={styles.cards}>
                                         <Card 
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
                        
                        })}
                </div>
            </div>
            
        </div>
        
    </>
}

export default DeckBuilder
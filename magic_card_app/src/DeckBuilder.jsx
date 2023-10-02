import Home from "./Home"
import styles from "./DeckBuilder.module.css"
import { useEffect, useState } from "react"
import Card from "./Card"

const DeckBuilder = () => {

    const [ addedCards, setAddedCards ] = useState([])

    const [ chosenColors, setChosenColors ] = useState("all")

    const [ notChosenColors, setNotChosenColors ] = useState(["R", "U", "B", "G", "W"])

    const [ commander, setCommander] = useState(false)

    const [ isCommander, setIsCommander ] = useState(false)

    const [ chosenDeckType, setChosenDeckType ] = useState("commander")

    const [ deckCost, setDeckCost ] = useState(0.00)

    const typesOfDecks = ["commander",
        "modern","pauper","standard","future",
        "historic","gladiator","pioneer","explorer",
        "legacy","vintage","penny","oathbreaker",
        "brawl","historicbrawl","alchemy","paupercommander",
        "duel","oldschool","premodern","predh"]
        
    const handleCheck = (e) => {
        if (e.target.checked) {
            if (chosenColors === "all") {
                setChosenColors([e.target.value])
                setNotChosenColors(notChosenColors.filter(color => {
                    if (color === e.target.value) {
                        return false
                    }
                    return true
                }))
            } else {
                setNotChosenColors(notChosenColors.filter(color => {
                    if (color === e.target.value) {
                        return false
                    }
                    return true
                }))
                setChosenColors(prevArray => [...prevArray, e.target.value])
            }   
        }
        if (!e.target.checked) {
            setNotChosenColors(prevArray => [...prevArray, e.target.value])
            setChosenColors(chosenColors.filter((color) => {
                return color !== e.target.value
            }))
        }
    }

    useEffect(() => {
        setAddedCards(cards => cards.filter(card =>  {
            for (const color of notChosenColors) {
                if (card.color_identity.indexOf(color) >= 0) {
                    return false
                }
            }
            return true
        }))
    }, [notChosenColors])
    
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
                setIsCommander={setIsCommander}
                isCommander={isCommander}
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
                        <input onChange={handleCheck} type="checkbox" name="red" value={"R"}/>                        
                        <label htmlFor="red">Red</label>
                        <input onChange={handleCheck} type="checkbox" name="blue" value={"U"}/>
                        <label htmlFor="blue">Blue</label>
                        <input onChange={handleCheck} type="checkbox" name="black" value={"B"}/>                        
                        <label htmlFor="black">Black</label>
                        <input onChange={handleCheck} type="checkbox" name="green" value={"G"}/>
                        <label htmlFor="green">Green</label>
                        <input onChange={handleCheck} type="checkbox" name="white" value={"W"}/>
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
                                         chosenDeckType={chosenDeckType}/>
                                 </div>
                        
                        })}
                </div>
            </div>
            
        </div>
        
    </>
}

export default DeckBuilder
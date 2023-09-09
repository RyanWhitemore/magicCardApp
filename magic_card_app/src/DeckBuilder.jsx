import Home from "./Home"
import styles from "./DeckBuilder.module.css"
import { useState } from "react"
import Card from "./Card"
import axios from "axios"

const DeckBuilder = () => {

    const [ addedCards, setAddedCards ] = useState([])

    const typesOfDecks = ["commander",
        "modern","pauper","standard","future",
        "historic","gladiator","pioneer","explorer",
        "legacy","vintage","penny","oathbreaker",
        "brawl","historicbrawl","alchemy","paupercommander",
        "duel","oldschool","premodern","predh"]
        
    
    


   // useEffect(() => {
   //     
   //     axios.post("http://localhost:5000/session", {
   //         userID: localStorage.getItem("userID"),
   //         deck: addedCards
   //     })
   //
   // }, [addedCards])

    const [ chosenDeckType, setChosenDeckType ] = useState("commander")

    const [ deckCost, setDeckCost ] = useState(0.00)
    
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
                </header>
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
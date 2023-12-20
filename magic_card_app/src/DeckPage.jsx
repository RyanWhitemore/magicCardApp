import styles from "./DeckPage.module.css"
import Header from "./Header"
import CardInDeck from "./CardInDeck"
import { useState } from "react"
import Card from "./Card"
import { useNavigate } from "react-router-dom"

const DeckPage = ({
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
    const deck = JSON.parse(localStorage.getItem("deck"))
    const commander = localStorage.getItem("commander") ? JSON.parse(localStorage.getItem("commander")) : null
    const cardTypes = ["Artifact", "Instant", "Creature", 
        "Enchantment", "Sorcery", "Land", "Basic Land", "Planeswalker",
        "Battle"
        ]
    const colors = ["W", "U", "B", "R", "G", "C"]
    const colorNames = ["White", "Blue", "Black", "Red", "Green", "Colorless"]
    
    const deckName = localStorage.getItem("deckName")

    const [ addedCards, setAddedCards ] = useState([])
    const [ deckCost, setDeckCost ] = useState(0.00)
    const [ filterColors, setFilterColors ] = useState([])
    const [ cmc, setCmc ] = useState([])
    const [typeArray, setTypeArray] = useState([])
    

    let maxCmc = 0;
    const cmcArray = []
    const navigate = useNavigate()

    const editdeck = () => {
        const colors = {"white": "W", "blue": "U", "black": "B", "red": "R", "green": "G"}
        const colorIdentity = JSON.parse(localStorage.getItem("deckColorIdentity"))
        const notChosenColors = ["W", "U", "B", "R", "G"]
        for (const color of colorIdentity) {
            const index = notChosenColors.indexOf(colors[color])
            console.log(index, color)
            if (index >= 0) {
                notChosenColors.splice(index, 1)
            }
        }
        localStorage.setItem("notChosenColors", JSON.stringify({data: notChosenColors}))
        navigate("/deckbuilder")
    }

    for (const card of deck) {
        if (card.card.cmc > maxCmc) {
            maxCmc = card.card.cmc
        }
    }

    for (let i=1; i <= maxCmc; i++) {
        cmcArray.push(i)
    }

    const filterDeckColor = (e) => {
        const color = e.target.value
        if (filterColors.length === 0) {
            setFilterColors(oldArray => [...oldArray, color])
        }  else if (filterColors.indexOf(color) >= 0) {
            setFilterColors(filterColors.filter(colorToCheck => {
                if (color === colorToCheck) {
                    return false
                }
                return true
            }))
        } else {
            setFilterColors(oldArray => [...oldArray, color])
        }
    }

    const filterDeckCmc = (e) => {
        const cmcToSet = e.target.value
        if (cmc.length === 0) {
            setCmc(oldArray => [...oldArray, cmcToSet])
        } else if (cmc.indexOf(cmcToSet) >= 0) {
            setCmc(cmc.filter(cmcToCheck => {
                if (cmcToSet === cmcToCheck) {
                    return false
                }
                return true
            }))
        } else {
            setCmc(oldArray => [...oldArray, cmcToSet])
        }
    }

    const filterDeckType = (e) => {
        const typeToSet = e.target.value
        if (typeArray.length === 0) {
            setTypeArray(oldArray => [...oldArray, typeToSet])
        } else if (typeArray.indexOf(typeToSet) >=0) {
            setTypeArray(typeArray.filter(typeToCheck => {
                if (typeToSet === typeToCheck) {
                    return false
                }
                return true
            }))
        } else {
            setTypeArray(oldArray => [...oldArray, typeToSet])
        }
    }

    return <div className={styles.main}>
        <Header setLoginClicked={setLoginClicked}
        loginClicked={loginClicked}
        fromHome={false}
        login={login}
        setUsername={setUsername}
        setPassword={setPassword}
        />
        <div className={styles.title}>
            <div className={styles.filter}>
                    <div className={styles.filterOptions}>
                        <div className={styles.colors}>
                            <label htmlFor="colors" >Colors:</label>
                            <div id="colors" className={styles.colorsMenu}>
                                {colors.map((color, index) => {
                                    return <>
                                        <div className={styles.color}>
                                            <input id={color}
                                            value={color} 
                                            onChange={filterDeckColor}
                                            type="checkbox"/>
                                            <label htmlFor={color}>{colorNames[index]}</label>
                                        </div>
                                    </>
                                })}
                            </div>
                        </div>
                        <div className={styles.cmc}>
                            <label htmlFor="cmc">CMC:</label>
                            <div id="cmc" className={styles.cmcMenu}>
                                {cmcArray.map(num => {
                                        return <>
                                            <div className={styles.num}>
                                                <input id={num} value={num} onChange={filterDeckCmc} type="checkbox"/>
                                                <label htmlFor={num}>{num}</label>
                                            </div>
                                        </>
                                    })}
                            </div>
                        </div>
                        <label htmlFor="type">Type:</label>
                        <div id="type" className={styles.typeMenu}>
                            {cardTypes.map(type => {
                                    return <>
                                    <div className={styles.type}>
                                        <input value={type} 
                                        id={type} 
                                        onChange={filterDeckType} type="checkbox"/>
                                        <label htmlFor={type}>{type}</label>
                                    </div>
                                    </>
                                })}
                        </div>
                        </div>
                            
            </div>
            <span className={styles.deckName}>{deckName} {" "} {deck.length}/{deck.deckType === "commander" ? 99 : 60}</span>
            <button className={styles.editButton}onClick={editdeck}>Edit Deck</button>                  
            
        
        <div className={styles.commander}>
            <Card
                card={commander}
                fromHome={false}
                withoutButton={true}
            />
        </div>
        <div className={styles.cardDiv}>
            {cardTypes.map(type => {
                if (typeArray.length > 0) {
                    if (typeArray.indexOf(type) < 0) {
                        return null
                    }
                }
                let numOfType = deck.reduce((sum, card) => {
                    if (card.card.type_line.indexOf(type) >= 0) {
                        sum += 1
                        return sum
                    }
                    return sum
                }, 0)
                return <div className={styles.typeDiv}>
                            <header>{type} ({numOfType})</header>
                            {deck.map(card => {
                                if (cmc.indexOf(card.card.cmc.toString()) < 0 && cmc.length > 0) {
                                    return null
                                }
                                if (filterColors.length > 0) {
                                    let matchedColor = false
                                    for (const color of filterColors) {
                                        if (card.card.color_identity.indexOf(color) >= 0 | 
                                        (color === "C" & card.card.color_identity.length === 0)) {
                                            matchedColor = true
                                        }
                                        if (matchedColor) {
                                            break
                                        }
                                    }
                                    if (!matchedColor) {
                                        return null
                                    }
                                }
                                const mana_array = card.card.mana_cost.replace(/[}]/g, "").split("{")
                                if (card.card.type_line.indexOf(type) >= 0) {
                                    return <CardInDeck
                                        fromBuilder={false}
                                        mana_array={mana_array}
                                        card={card}
                                        addedCards={addedCards}
                                        setAddedCards={setAddedCards}
                                        deckCost={deckCost}
                                        setDeckCost={setDeckCost}
                                    />
                                } else {
                                    return null
                                }
                            })}
                        </div>
                })}
        </div>
    </div>
    </div>
}


export default DeckPage
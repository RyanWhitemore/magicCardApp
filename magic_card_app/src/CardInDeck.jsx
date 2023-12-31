import Popup from "reactjs-popup"
import styles from "./CardInDeck.module.css"
import {useEffect, useRef, useState} from "react"

// hook to detect a click outside of an element
const useOutsideAlerter = (ref, setPopup) => {
    useEffect(() => {
        const handleOutsideClick = (e) => {
            // if the reference does not contain the target of the click
            if (ref.current && !ref.current.contains(e.target)) {
                setPopup(false)
            }
        }

        document.addEventListener("mousedown", handleOutsideClick)

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick)
        }
    }, [ref, setPopup]) 
}


const CardInDeck = ({
    card, mana_array, addedCards, setAddedCards,
    deckCost, setDeckCost, fromBuilder
}) => {

    const backgroundColors = {
        multi: {backgroundColor: "rgb(188, 175, 107)", boxShadow: "2px 2px rgb(89, 94, 88)"},
        colorless: {backgroundColor: "darkgray", boxShadow: "2px 2px rgb(84, 84, 92)"},  
        G: {backgroundColor: "rgb(200, 213, 204)", boxShadow: "2px 2px rgb(89, 94, 88)"},
        R: {backgroundColor: "rgb(234, 213, 210)", boxShadow: "2px 2px rgb(93, 50, 44)"},
        U: {backgroundColor: "rgb(210, 226, 242)", boxShadow: "2px 2px rgb(113, 122, 139)"},
        B: {backgroundColor: "dimgray", boxShadow: "2px 2px rgb(55, 43, 45)"},
        W: {backgroundColor: "rgb(241, 238, 247)", boxShadow: "2px 2px rgb(141, 136, 142)"}

    }

    const wrapperRef = useRef(null)

    const [ numInDeck, setNumInDeck ] = useState(card.numInDeck)

    const [ popup, setPopup ] = useState(false)

    useOutsideAlerter(wrapperRef, setPopup)

    const addCardInDeck = () => {
        if (localStorage.getItem("deckType") === "commander") {
            if (card.card.type_line.includes("Basic Land")) {
                setNumInDeck(numInDeck + 1)
                card.numInDeck = numInDeck + 1
                if (card.card.prices) {
                    let newDeckCost = parseFloat(deckCost) + parseFloat(card.card.prices.usd)
                    setDeckCost(newDeckCost.toFixed(2))
                }
            }
            return 
        }
        if (numInDeck >= 4) {
            return
        }
        setNumInDeck(numInDeck + 1)
        card.numInDeck = numInDeck + 1
        if (card.card.prices) {
            let newDeckCost = parseFloat(deckCost) + parseFloat(card.card.prices.usd)
            setDeckCost(newDeckCost.toFixed(2))
        }
    }

    const removeCardInDeck = () => {
        if (numInDeck > 1) {
            setNumInDeck(numInDeck -1)
            card.numInDeck = numInDeck -1
            if (card.card.prices) {
                let newDeckCost = parseFloat(deckCost) - parseFloat(card.card.prices.usd)
                setDeckCost(newDeckCost.toFixed(2))
            }
        } else {
            const newDeck = addedCards.filter((cardInDeck) => {
                if (card.card.name === cardInDeck.card.name) {
                    return false
                }
                return true
            })
            console.log(card.card.prices.usd)
            setAddedCards(newDeck)
            localStorage.setItem("deck", JSON.stringify(newDeck))
            if (card.card.prices) {
                let newDeckCost = parseFloat(deckCost) - parseFloat(card.card.prices.usd)
                setDeckCost(newDeckCost)
            }
        }
    }

    let colorIdentity = ""
    let fontSize = 0

    if (card.card.type_line.indexOf("Artifact") >= 0 | card.card.color_identity.length === 0) {
        colorIdentity = "colorless"
    } else if (card.card.color_identity.length > 1) {
        colorIdentity = "multi"
    } else {
        colorIdentity = card.card.color_identity[0]
    }

    if (card?.card.name.length >= 17) {
        fontSize = "70%"
    } else if (card.card.color_identity.length === 5) {
        fontSize = "70%"
    } else if (card.card.color_identity.length === 3 & card.card.name.length > 15) {
        fontSize = "70%"
    } else {
        fontSize = "100%"
    }

    return <>
        <Popup open={popup}><img
            src={card?.card.image_uris?.border_crop}
            alt={card?.card.name}
            ref={wrapperRef}
        />
        <p>{card?.card.prices.usd}</p>
        </Popup>
        <div className={styles.cardContainer}>
            <div className={styles.cardDiv}
                style={backgroundColors[colorIdentity]}  
            ><p onClick={() => setPopup(true)}

                style={{fontSize: fontSize}}>{card?.card.name} </p> 
            <div className={styles.manaSection}>
            {mana_array.map((pip, index) => {
                if (pip === "") {
                    return null
                }
                    if (pip >= 0) {
                        return <p key={"colorless" + card.card.id + index} className={styles.manaPip}>{pip}</p>
                    }
                    if (pip === "U") {
                        return <img key={"blue" + card.card.id + index} className={styles.pipImage} alt="blue pip" src={"/bluePip.png"} width="15px" height="15px"/>
                    }
                    if (pip === "G") {
                        return <img key={"green" + card.card.id + index} className={styles.pipImage} alt="green pip" src={"/greenPip.png"} width="15px" height="15px"/>
                    }
                    if (pip === "B") {
                        return <img key={"black" + card.card.id + index} className={styles.pipImage} alt="Black pip" src="/blackPip.png" width={"15px"} height="15px"/>
                    }
                    if (pip === "W") {
                        return <img key={"white" + card.card.id + index} className={styles.pipImage} alt="white pip" src="/whitePip.png" width={"15px"} height="15px"/>
                    }
                    if (pip === "R") {
                        return <img key={"red" + card.card.id + index} className={styles.pipImage} alt="Red pip" src="/redPip.png" width={"15px"} height="15px"/>
                    }
                    return null
                })}
                {fromBuilder ? <div className={styles.counter}>
                    <button className={styles.counterButton} onClick={addCardInDeck} style={backgroundColors[colorIdentity]}>+</button>
                    <p className={styles.counterText}> {numInDeck} </p>
                    <button className={styles.counterButton} onClick={removeCardInDeck} style={backgroundColors[colorIdentity]}>-</button>
                </div> : <p className={styles.counterText}>{numInDeck}</p>}
                </div>
            </div>
        </div>
    </>

}

export default CardInDeck
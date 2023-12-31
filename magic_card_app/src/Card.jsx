import "./Card.css"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import Popup from "reactjs-popup"


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

const Card = ({
            card, 
            withoutButton,
            fromMyCards,
            fromDeckBuilder,
            setAddedCards,
            addedCards,
            inDeck,
            chosenDeckType,
            deckCost,
            setDeckCost,
            setCommander,
            setIsCommander,
            isCommander,
            setNotChosenColors,
            setChosenColors,
            commander,
            numberOfType,
            inHand,
            inPlay,
            setMana,
        }) => {
        
        // initialize variables for various buttons
        let button
        let cardImage
        let addButton
        let quantity
        let commanderButton

        const userID = localStorage.getItem("userID")

        // initialize deck count for how many of a card is in the deck
        const [ deckCount, setDeckCount ] = useState(1)

        // initialize state for how many of a card is owned by user
        const [ numInColl, setNumInColl ] = useState(card.quantity)

        const [ popup, setPopup ] = useState(false)

        const [ showAdded, setShowAdded ] = useState(false)

        const [ message, setMessage ] = useState('')

        const [ tapped, setTapped ] = useState(false)

        const isLoggedIn = userID === "guest" ? false : true 

        const wrapperRef = useRef(null)

        useOutsideAlerter(wrapperRef, setPopup)

        // function to link to tcg player buy page
        const buyCard = () => {
            window.open(card.purchase_uris.tcgplayer, "_blank")
        }

        // function to check if an array contains given object
        const checkCardArrayForObj = (obj, array) => {
            for (let i =0; i < array.length; i++) {
                if (array[i].card.id === obj.id) {
                    return true
                }
            }
            return false
        }

        useEffect(() => {
            setTimeout(() => {
                setShowAdded(false)
            }, 3000)
        })


        // function to add a card as a commander in deck builder
        const addCommander = () => {
            // initialize array with all possible colors
            const colors = ["G", "B", "U", "R", "W"]
            if (card.id === JSON.parse(localStorage.getItem("commander")).id) {
                return
            }
            if (card.legalities[chosenDeckType] === "legal") {
                if (card.prices.usd) {
                    let newDeckCost = parseFloat(deckCost) + parseFloat(card.prices.usd)
                    newDeckCost = parseFloat(newDeckCost)
                    newDeckCost = newDeckCost.toFixed(2)
                    localStorage.setItem("deckCost", newDeckCost)
                    setDeckCost(newDeckCost)
                }
                localStorage.setItem("commander", JSON.stringify(card))
                localStorage.setItem("isCommander", JSON.stringify(true))
                setCommander(card)
                setIsCommander(true)
                setChosenColors(card.color_identity)
                // set the not chosen colors to an array of all the colors
                // that are not in the commanders identity, not chosen colors
                // is used to filter the cards that can be added to deck
                setNotChosenColors(colors.filter((color) => {
                    for (const e of card.color_identity) {
                        if (color.indexOf(e) >= 0) {
                            return false
                        }
                    }
                    return true
                }))
                localStorage.setItem("notChosenColors", JSON.stringify({data: colors.filter((color) => {
                    for (const e of card.color_identity) {
                        if (color.indexOf(e) >= 0) {
                            return false
                        }
                    }
                    return true
                })}))
            }
        }

        // function for adding a card to the deck in deckbuilder
        const addCard = (e) => {
            // check if the card is already in the deck and if so do nothing
            if (checkCardArrayForObj(card, addedCards)) {
                if (chosenDeckType !== "commander") {
                    return
                } else {
                    return
                }
            }
            if (card === commander) {
                return
            }
            // check if card is legal in chosen format and if it is add it to deck
            if (!chosenDeckType | card.legalities[chosenDeckType] === "legal") {
                const currentDeck = [...addedCards]
                currentDeck.push({card: card, numInDeck: 1})
                
                localStorage.setItem("deck", JSON.stringify(currentDeck))

                if (card.prices.usd) {
                    setAddedCards(currentDeck)
                    let newDeckCost = parseFloat(deckCost) + parseFloat(card.prices.usd)
                    newDeckCost = parseFloat(newDeckCost)
                    newDeckCost = newDeckCost.toFixed(2)
                    localStorage.setItem("deckCost", newDeckCost)
                    setDeckCost(newDeckCost)
                } else {
                    setAddedCards(currentDeck)
                }
            } else {
                return
            }
        
        }

        // function to decrement number of cards in deck
        // or remove the card if there is only one in the deck
        const removeCardInDeck = () => {
            if (isCommander) {
                if (card.prices.usd) {
                    let newDeckCost = parseFloat(deckCost) - parseFloat(card.prices.usd)
                    newDeckCost = parseFloat(newDeckCost)
                    newDeckCost = newDeckCost.toFixed(2)
                    localStorage.setItem("deckCost", newDeckCost)
                    setDeckCost(newDeckCost)
                }
                // if the commander card is removed reset the chosen
                // and not chosen colors so all cards are shown
                setNotChosenColors(["G", "B", "U", "R", "W"])
                setChosenColors("all")
                return localStorage.setItem("commander", null)
            } else {
                // if the card object has card price in usd update the deck cost
                if (card.prices.usd) {
                    let newDeckCost = parseFloat(deckCost) - parseFloat(card.prices.usd)
                    newDeckCost = parseFloat(newDeckCost)
                    newDeckCost = newDeckCost.toFixed(2)
                    localStorage.setItem("deckCost", newDeckCost)
                    setDeckCost(newDeckCost)
                }
                if (deckCount > 1) {
                    setDeckCount(deckCount - 1)
                } else {
                    // if there is only one of the card in the deck
                    // find the index of that card and remove that index
                    const newAddedCards = [...addedCards]
                    const indexToRemove = addedCards.indexOf(card)
                    newAddedCards.splice(indexToRemove, 1)
                    localStorage.setItem("deck", JSON.stringify(newAddedCards))
                    setAddedCards(newAddedCards)
                }
            }
        }

        // function to add card to user collection
        // endpoint makes new entry if one doesnt exist
        // and updates the quantity owned if entry does exist
        const handleSubmit = async (e) => {
            e.preventDefault()
            const results = await axios.put(`http://localhost:${process.env.REACT_APP_SERVPORT}/addCard`, {
                card: card,
                userId: userID
            })

            if (results.status === 200) {
                setMessage("Added")
                setShowAdded(true)
                setNumInColl(card.quantity + 1)
                card.inCollection = true
            }
            if (results.status === 400) {
                setMessage("There was a Problem, try again")
                setShowAdded(true)
            }
        }

        // function to delete card from user collection
        // endpoint deletes entry if only one is owned
        // or updates quantity if more than one is owned
        const handleDelete = (e) => {
            e.preventDefault()
            axios.delete(`http://localhost:${process.env.REACT_APP_SERVPORT}/deleteCard?cardId=` 
                + card.id + "&userId=" + userID)
        }

        // this is here to return nothing from the card
        // react component if the card is deleted from the 
        // users collection
        if (numInColl < 1) {
            return
        } 

        // if the card component is called from the deckbuilder component
        // the initialized add button is given the value of a react fragment
        // so the button will appear under the card image
        if (fromDeckBuilder) {
            addButton = <>
                <button value={card} onClick={addCard}>Add to Deck</button>
            </>
            // if the card is able to act as a commander a
            // commander button is given the value of add commander button
            if ((chosenDeckType === "commander" && 
                card.type_line.includes("Legendary Creature")) | 
                (chosenDeckType === "commander" && 
                card.type_line.includes("Legendary Planeswalker"))) {
                    commanderButton = <>
                    <button value={card} onClick={addCommander}>Add as Commander</button>        
            </>
            }
        }

        // with button is a boolean that comes from the card page
        // component and if it is true the button to add card to
        // collection is given a value
        if (!withoutButton && isLoggedIn) {
            button = <>
                <form onSubmit={handleSubmit}>
                        <button className="add-card" type="submit">
                            Add card
                        </button>
                </form>
                <button onClick={buyCard}>Buy Card</button>
            </>
            
        }

        if (!withoutButton && !isLoggedIn) {
            button = <>
                <button onClick={buyCard}>Buy Card</button>
            </>
        }

        // if the card component comes from the mycards component 
        // a quantity is given value as well as a button to delete
        // the card from the collection
        if (fromMyCards === true) {
            quantity = <p className="quantity">Quantity owned: {numInColl}</p>
        }
        
        // if card image exists
        if (card.image_uris) {
            if (inDeck) {
                cardImage = [<div className="commanderImageDiv">
                        <div className="buttonsDiv" >
                            <img
                                onClick={() => {setPopup(true)}}
                                width="180px"
                                src={card.image_uris.border_crop} 
                                alt={card.name}
                            ></img>
                            <div className="buttonsFlex">
                                <button className="removeInDeck" onClick={removeCardInDeck}>-</button>
                            </div>
                        </div>
                    </div>]
            } else {
                cardImage = <>
                <div className="imageDiv">
                    <img
                        className="cardImage"
                        onClick={() => {setPopup(true)}}
                        width="180px"
                        src={card.image_uris.border_crop} 
                        alt={card.name}
                        style={{transform: tapped ? 'rotate(90deg)' : 'none'}}
                    ></img>
                    {addButton} 
                    {commanderButton}
                </div>
            </> 
            }
        } 
        // if card image does not exist
        else {
            cardImage = <>
                <p>{card.name}</p>
                <p></p>
                <p></p>
                <p></p>
                <p></p>
            </>
        }


            return <>
                <div key={card.name} className="image">
                    {!cardImage.length ? cardImage : cardImage.map(card => {
                        return card
                    })}
                    {button}
                    {showAdded && <span className="addedAlert">{message}</span>}
                    <Popup
                    open={popup}
                    >
                        <img
                            src={card.image_uris?.border_crop}
                            alt={card.name}
                            ref={wrapperRef}
                        />
                    </Popup>
                    { card.prices?.usd ? !inHand && <p className="price"
                    >${card.prices.usd}</p> : !inHand && <p>Price Unavailable</p>}
                    {fromMyCards && <>
                        <div className="addAndRemove">
                            <button 
                            className="addAndRemoveButton"
                            onClick={(e) => {
                                e.preventDefault()
                                handleSubmit(e)
                                setNumInColl(numInColl + 1)
                            }}>+</button>
                            {quantity}
                            <button 
                            className="addAndRemoveButton"
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete(e)
                                setNumInColl(numInColl - 1)
                            }}>-</button>
                        </div>
                    </>}
                    {inPlay ? <button onClick={() => {
                        if (card.oracle_text.includes("{T}: Add") & !tapped) {
                            if (card.oracle_text.includes("Add one mana of any color in your commander's color identity")) {
                                console.log("Choose Mana color")
                            }
                            if (card.oracle_text.includes("Add once mana of any color")) {
                                console.log("Choose Mana Color")
                            }
                        }
                        setTapped(!tapped)
                }}>Tap</button> : null}
                </div>
        </>

   
    
    
}

export default Card
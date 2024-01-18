import "./Card.css"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import Popup from "reactjs-popup"
import AddCircleIcon from "@mui/icons-material/AddCircle"
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import IconButton from "@mui/material/IconButton"
import DisplayCard from "@mui/material/Card"
import CardMedia from "@mui/material/CardMedia"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { useTheme } from "@emotion/react"
import { useMediaQuery } from "@mui/material"
import Tooltip from "@mui/material/Tooltip"
import Badge from "@mui/material/Badge"
import SwapVerticalCircleIcon from "@mui/icons-material/SwapVerticalCircle"
import Skeleton from "@mui/material/Skeleton"


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
            fromAddCards,
            inCollection,
            numCollected
        }) => {
        
        // initialize variables for various buttons
        let button
        let quantity

        const userID = localStorage.getItem("userID")

        // initialize state for how many of a card is owned by user
        const [ numInColl, setNumInColl ] = useState(numCollected)
            
        const [ popup, setPopup ] = useState(false)

        const [ showAdded, setShowAdded ] = useState(false)

        const [ message, setMessage ] = useState('')

        const [ tapped, setTapped ] = useState(false)

        const [ hovered, setHovered ] = useState(false)

        const [ collected, setCollected ] = useState(inCollection)

        const [ cardBack, setCardBack ] = useState(false)

        const [ loading, setLoading ] = useState(true)
 
        const isLoggedIn = userID === "guest" ? false : true 

        const wrapperRef = useRef(null)

        const theme = useTheme()

        const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"))
        const isMediumScreen = useMediaQuery(theme.breakpoints.between("md", "lg"))

        useOutsideAlerter(wrapperRef, setPopup)

        const cardCountLabel = () => {
            return `${numCollected} ${card.name} in Collection`
        }
        
        
        
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



        // function to add card to user collection
        // endpoint makes new entry if one doesnt exist
        // and updates the quantity owned if entry does exist
        const handleSubmit = async (e) => {
            e.preventDefault()
            if (numInColl === 0) {
                setCollected(true)
                card.inCollection = true
            }
            setNumInColl(numInColl + 1)
            const results = await axios.put(`http://localhost:${process.env.REACT_APP_SERVPORT}/addCard`, {
                card: card,
                userId: userID
            })

            if (results.status === 200) {
                setMessage("Added")
                setShowAdded(true)
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
            const newNum = numInColl - 1
            if (newNum === 0) {
                setCollected(false)
                card.inCollection = false
            }
            setNumInColl(newNum)
            axios.delete(`http://localhost:${process.env.REACT_APP_SERVPORT}/deleteCard?cardId=` 
                + card.id + "&userId=" + userID)
        } 


        // with button is a boolean that comes from the card page
        // component and if it is true the button to add card to
        // collection is given a value
        if (!withoutButton && isLoggedIn) {
            button = <div style={{
                position: "relative"
            }}>
                <Tooltip title={card.prices.usd ? `$${card.prices.usd}` : "Price Unavailable"}>
                    <IconButton 
                        onClick={buyCard}
                    >
                        <ShoppingCartIcon />
                    </IconButton>
                </Tooltip>
            </div>
            
        }

        // if the card component comes from the mycards component 
        // a quantity is given value as well as a button to delete
        // the card from the collection
        if (fromMyCards === true) {
            quantity = <p className="quantity">Quantity owned: {numInColl}</p>
        }

            return <>
                <DisplayCard sx={{
                        position: "relative",
                        width: "150px",
                        textAlign: "center",
                    }} elevation={24}
                    color="primary"
                    key={card.name}
                    onMouseOver={() => isSmallScreen ? null : setHovered(true)}
                    onMouseOut={() => isSmallScreen ? null : setHovered(false)}
                >
                    {!loading ? <Tooltip 
                        title={card.prices?.usd ? `$ ${card.prices.usd}`: "Price Unavailable"}
                        placement="top"
                    > 
                        <CardMedia 
                            onLoad={() => {setLoading(false)}}
                            component="img"
                            sx={{
                                opacity: (!collected && fromAddCards) ? 0.7 : 1
                            }}
                            image={card.image_uris ? card.image_uris.border_crop : 
                                isSmallScreen ? cardBack ? card.card_faces[1].image_uris.border_crop :
                                card.card_faces[0].image_uris.border_crop : 
                                hovered ? card.card_faces[1].image_uris.border_crop :
                                card.card_faces[0].image_uris.border_crop
                            }
                            alt={card.name}
                            onClick={() => setPopup(true)}
                            onTouchStart={() => setPopup(true)}
                            onTouchEnd={() => setPopup(false)}
                        />
                    </Tooltip> : <Skeleton>
                            <Tooltip 
                        title={card.prices?.usd ? `$ ${card.prices.usd}`: "Price Unavailable"}
                        placement="top"
                    > 
                        <CardMedia 
                            onLoad={() => setLoading(false)}
                            component="img"
                            sx={{
                                opacity: (!collected && fromAddCards) ? 0.7 : 1
                            }}
                            image={card.image_uris ? card.image_uris.border_crop : 
                                isSmallScreen ? cardBack ? card.card_faces[1].image_uris.border_crop :
                                card.card_faces[0].image_uris.border_crop : 
                                hovered ? card.card_faces[1].image_uris.border_crop :
                                card.card_faces[0].image_uris.border_crop
                            }
                            alt={card.name}
                            onClick={() => setPopup(true)}
                            onTouchStart={() => setPopup(true)}
                            onTouchEnd={() => setPopup(false)}
                        />
                    </Tooltip>
                        </Skeleton>}  
                    { isSmallScreen && card.card_faces ? <IconButton
                        size="large"
                        sx={{
                            position: "absolute",
                            left: "110px",
                            top: "165px",
                            color: theme.palette.primary.dark
                        }}
                        onClick={() => setCardBack(!cardBack)}
                    >
                            <SwapVerticalCircleIcon fontSize="inherit"/>
                        </IconButton> : null}
                     <Box sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "space-between"
                    }}>
                        { fromAddCards | fromMyCards ? <><IconButton
                                onClick={handleDelete}
                                variant="contained"
                            >
                                <RemoveCircleIcon 
                                    color="primary"
                                />
                            <Badge variant="button"
                            color={"primary"}
                            showZero
                            badgeContent={numInColl}
                            aria-label={cardCountLabel()}
                            sx={{
                                position: "absolute",
                                left: "75px"
                            }}
                            >
                            </Badge>
                            </IconButton>
                            <IconButton 
                                onClick={handleSubmit}
                                variant="contained"
                            >
                                <AddCircleIcon
                                    color="primary"
                                />
                        </IconButton> 
                        </>: null}
                    </Box>
                    {showAdded && <span className="addedAlert">{message}</span>}
                    <Popup
                    open={popup}
                    >
                        {!card.card_faces ? <img
                            src={card.image_uris ? card.image_uris.border_crop : null}
                            alt={card.name}
                            ref={wrapperRef}
                            style={{
                                width: isSmallScreen ? "200px" : "auto"
                            }}
                        /> : <DisplayCard ref={wrapperRef}
                            sx={{
                                display: "flex",
                                backgroundColor: theme.palette.background.default
                            }}
                        >
                                <CardMedia
                                    sx={{
                                        width: isSmallScreen ? "200px" : "auto"
                                    }}
                                    component="img"
                                    image={card.card_faces[0].image_uris ? 
                                        card.card_faces[0].image_uris.border_crop : null}
                                    alt={card.name + "front face"}
                                />
                                <CardMedia
                                    sx={{
                                        width: isSmallScreen ? "200px" : "auto"
                                    }}
                                    component="img"
                                    style={{
                                        marginLeft: "20px"
                                    }}
                                    image={card.card_faces[1].image_uris ? 
                                        card.card_faces[1].image_uris.border_crop : null}
                                    alt={card.name + "back face"}
                                /> 
                            </DisplayCard>}
                    </Popup>
                    {fromDeckBuilder ? <Box>
                        <Button onClick={addCard}>Add Card</Button>
                        { card.type_line.includes("Legendary Creature")
                        | card.type_line.includes("Legendary Planeswalker") ? 
                        <Button onClick={addCommander}>Add As Commander</Button> : null}
                    </Box> : null}
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
                </DisplayCard>
        </>

   
    
    
}

export default Card
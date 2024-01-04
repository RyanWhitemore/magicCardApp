import styles from "./Fishbowl.module.css"
import { useState, useEffect, useRef } from "react"
import Card from "./Card"
import Popup from "reactjs-popup"
import { useOutsideAlerter } from "./util"

const FishBowl = () => {

    const  [ deck, setDeck ] = useState(JSON.parse(localStorage.getItem("deck")))

    const [commander, setCommander ] = useState(JSON.parse(localStorage.getItem("commander")))

    const [ landsInPlay, setLandsInPlay ] = useState([])

    const [ discardPile, setDiscardPile ] = useState([])
    
    const [ deckShuffled, setDeckShuffled ] = useState([])

    const [ cardsInPlay, setCardsInPlay ] = useState([])

    const [ sampleHand, setSampleHand ] = useState([])

    const [ artifactsEnchanments, setArtifactsEnchantments ] = useState([])

    const [ exile, setExile ] = useState([])

    const [ commanderInPlay, setCommanderInPlay ] = useState(false)

    const [ graveyardPopup, setGraveyardPopup ] = useState(false)
    
    const [ libraryPopup, setLibraryPopup ] = useState(false)
    
    const [ exilePopup, setExilePopup ] = useState(false)

    const [ mana, setMana ] = useState({})

    const exileRef = useRef(null)
    
    const libraryRef = useRef(null)

    const graveyardRef = useRef(null)

    useOutsideAlerter(graveyardRef, setGraveyardPopup)

    useOutsideAlerter(libraryRef, setLibraryPopup)

    useOutsideAlerter(exileRef, setExilePopup)

    const shuffleDeck = (deck, totalShuffle) => {
        const deckToShuffle = deck.slice(0)
        if (totalShuffle) {
            for (const card of deck) {
                if (card.numInDeck > 1) {
                    for (let i = 0; i < card.numInDeck - 1; i++) {
                        deckToShuffle.push(card)
                    }
                }
            }
        }
        
        for (let i = deckToShuffle.length - 1; i > 0; i--) {
            const index = Math.floor(Math.random() * (i + 1));
            const temp = deckToShuffle[i]
            deckToShuffle[i] = deckToShuffle[index]
            deckToShuffle[index] = temp
        }
        return setDeckShuffled(deckToShuffle)
    }

    useEffect(() => {
        shuffleDeck(deck)
    }, [])

    const drawHand = () => {

        if (deckShuffled.length < 7) {
            console.log("Not Enough Cards")
            return
        }

        const hand = deckShuffled.slice(0, 7)

        const remainingDeck = deckShuffled.slice(7)

        setDeckShuffled(remainingDeck)
        setSampleHand(hand)
    }

    const playCard = (card) => {
        if (card.card.type_line.includes("Land")) {
            setLandsInPlay(oldArray => [...oldArray, card])
        } else if (card.card.type_line.includes("Artifact") | 
        card.card.type_line.includes("Enchantment")) {
            setArtifactsEnchantments(oldArray => [...oldArray, card])
        } else if (card.card.type_line.includes("Instant") |
        card.card.type_line.includes("Sorcery")) {
            setDiscardPile(oldArray => [card, ...oldArray])
        } else {
            setCardsInPlay(oldArray => [...oldArray, card])
        }
    }

    const sendCardToGraveyard = (card, index) => {
        if (card.card.type_line.includes("Land")) {
            const newLandsInPlay = landsInPlay.slice(0)

            newLandsInPlay.splice(index, 1)

            setLandsInPlay(newLandsInPlay)
            setDiscardPile(oldArray => [card, ...oldArray])
        } else if (card.card.type_line.includes("Artifact") | 
        card.card.type_line.includes("Enchantment")) {
            const newArtifactsEnchantments = artifactsEnchanments.slice(0)

            newArtifactsEnchantments.splice(index, 1)

            setArtifactsEnchantments(newArtifactsEnchantments)
            setDiscardPile(oldArray => [card, ...oldArray])
        } else if (card.card.type_line.includes("Instant") |
        card.card.type_line.includes("Sorcery")) {

            setDiscardPile(oldArray => [card, ...oldArray])
        } else {
            const newCardsInPlay = cardsInPlay.slice(0)

            newCardsInPlay.splice(index, 1)
            setCardsInPlay(newCardsInPlay)
            setDiscardPile(oldArray => [card, ...oldArray])
        }
    }

    const sendCardToExile = (card, index) => {
        if (card.card.type_line.includes("Land")) {
            const newLandsInPlay = landsInPlay.slice(0)

            newLandsInPlay.splice(index, 1)

            setLandsInPlay(newLandsInPlay)
            setExile(oldArray => [card, ...oldArray])
        } else if (card.card.type_line.includes("Artifact") | 
        card.card.type_line.includes("Enchantment")) {
            const newArtifactsEnchantments = artifactsEnchanments.slice(0)

            newArtifactsEnchantments.splice(index, 1)

            setArtifactsEnchantments(newArtifactsEnchantments)
            setExile(oldArray => [card, ...oldArray])
        } else if (card.card.type_line.includes("Instant") |
        card.card.type_line.includes("Sorcery")) {

            setExile(oldArray => [card, ...oldArray])
        } else {
            const newCardsInPlay = cardsInPlay.slice(0)

            newCardsInPlay.splice(index, 1)
            setCardsInPlay(newCardsInPlay)
            setExile(oldArray => [card, ...oldArray])
        }
    }

    const playCommander = () => {
        setCardsInPlay(oldArray => [...oldArray, {card: commander, commander: true}])
        setCommander(false)
        setCommanderInPlay(false)
        
    }

    if (commanderInPlay) {
        playCommander()
    }

    return  <div className={styles.fishBowl}>
    <Popup open={graveyardPopup}
    modal>
        <div ref={graveyardRef} className={styles.graveyardPopup}>
            {discardPile.map((card, index) => {
                return <div className={styles.card}>
                    <Card
                        card={card.card}
                        inHand={true}
                        withoutButton={true}/>
                    <button className={styles.drawButton}
                    onClick={() => {
                        const indexToRemove = discardPile.indexOf(card)
                        const discardPileToSet = discardPile.slice(0)
                        
                        discardPileToSet.splice(indexToRemove, 1)
                    
                        setDiscardPile(discardPileToSet)
                        playCard(card, index)
                    }}>
                        Cast From Graveyard
                    </button>
                    <button className={styles.drawButton}
                    onClick={() => {
                        const indexToRemove = discardPile.indexOf(card)
                        const discardPileToSet = discardPile.slice(0)
                        
                        discardPileToSet.splice(indexToRemove, 1)
                    
                        setDiscardPile(discardPileToSet)
                        setExile(oldArray => [...oldArray, card])
                    }}>Exile From Graveyard</button>
                    <button className={styles.drawButton} onClick={() => {
                        const newDiscardPile = discardPile.slice(0)
                        newDiscardPile.splice(index, 1)
                        
                        setDiscardPile(newDiscardPile)
                        setSampleHand(oldArray => [...oldArray, card])
                    }}>
                        Put In Hand
                    </button>
                </div>
            })}
        </div>
    </Popup>
    <Popup open={exilePopup}>
            <div ref={exileRef} className={styles.exilePopup}>
                {exile.map((card, index) => {
                    return <div className={styles.cardWithButtons}>
                            <Card
                            card={card.card}
                            withoutButton={true}
                            inHand={true}
                            />
                            <button className={styles.drawButton} onClick={() => {
                                const newExile = exile.slice(0)

                                newExile.splice(index, 1)
                                setExile(newExile)

                                playCard(card)
                            }}>
                                Cast From Exile
                            </button>
                        </div>
                })}
            </div>
    </Popup>
    <Popup open={libraryPopup}>
            <div ref={libraryRef} className={styles.libraryPopup}>
                <button className={styles.drawButton} onClick={() => {
                    setLibraryPopup(false)
                    shuffleDeck(deckShuffled)
                }}>
                    Suffle Deck
                </button>
                {deckShuffled.map((card, index) => {
                    return <div className={styles.cardWithButtons}>
                        <Card
                        card={card.card}
                        withoutButton={true}
                        inHand={true}
                        />
                        <button 
                        className={styles.drawButton}
                        onClick={() => {
                            let updatedShuffledDeck = deckShuffled.slice(0)
                            const newCardToAdd = updatedShuffledDeck[index]
                            updatedShuffledDeck.splice(index, 1)

                            setDeckShuffled(updatedShuffledDeck)
                            setSampleHand(oldArray => [...oldArray, newCardToAdd])
                        }}>
                            Put in Hand
                        </button>
                        <button 
                        className={styles.drawButton}
                        onClick={() => {
                            let updatedShuffledDeck = deckShuffled.slice(0)
                            const newCardToAdd = updatedShuffledDeck[index]
                            updatedShuffledDeck.splice(index, 1)

                            setDeckShuffled(updatedShuffledDeck)
                            playCard(newCardToAdd)
                        }}>
                            Cast
                            </button>
                    </div>
                })}
            </div>
    </Popup>
    <div className={styles.inPlay}>
        {cardsInPlay.map((card, index) => {
            return <div className={styles.card}>
                <Card card={card.card}
                    withoutButton={true}
                    inHand={true}
                    inPlay={true}/>
                <button onClick={() => {
                    sendCardToGraveyard(card, index)
                }}>
                    Send To Graveyard
                </button>
                <button onClick={() => {
                    sendCardToExile(card, index)
                }}>
                    Send To Exile
                </button>
                {card.commander ? <button className={styles.drawButton} onClick={() => {
                    const newCardsInPlay =  cardsInPlay.slice(0)
                    newCardsInPlay.splice(index, 1)

                    setCardsInPlay(newCardsInPlay)
                    setCommander(card.card)
                }}>
                    Send To Command Zone
                </button> : null}
            </div>
        })}
    </div>
   {commander ? <div className={styles.commander}>
        <Card
        card={commander}
        withoutButton={true}
        inHand={true}/>
        <button className={styles.drawButton} onClick={() => setCommanderInPlay(true)}>
            Play Commander
        </button>
    </div> : null}
    <div className={styles.lands}>
        {landsInPlay.map((card, index) => {
            return <div className={styles.card}>
                    <Card card={card.card}
                    withoutButton={true}
                    inHand={true}
                    inPlay={true}/>
                <button className={styles.drawButton} onClick={() => {
                    const newLandsInPlay = landsInPlay.slice(0)
                    newLandsInPlay.splice(index, 1)
                    
                    sendCardToGraveyard(card, index)
                    setLandsInPlay(newLandsInPlay)
                }}>Send To Graveyard</button>
                <button className={styles.drawButton} onClick={() => {
                    sendCardToExile(card, index)
                }}>Send To Exile</button>
            </div>
        })}
    </div>
    <div className={styles.graveyardExile}>
        <div className={styles.exile}>
            { exile.length > 0 ? <Card
                card={exile[0].card}
                withoutButton={true}
                inHand={true}
            /> : null}
            <button className={styles.drawButton} onClick={() => {
                setExilePopup(true)
            }}>
                View Exile
            </button>
        </div>
        <div className={styles.graveyard}>
            {discardPile.length > 0 ? <Card
                card={discardPile[0].card}
                withoutButton={true}
                inHand={true}
            /> : null}
            <button onClick={() => setGraveyardPopup(true)}
            className={styles.drawButton}>View Graveyard</button>
        </div>
    </div>
    <div className={styles.artifactsEnchantments}>
        {artifactsEnchanments.map((card, index) => {
            return <div className={styles.card}>
                <Card
                card={card.card}
                withoutButton={true}
                inHand={true}
                inPlay={true}
                setMana={setMana}/>
                <button className={styles.drawButton} onClick={() => {
                        sendCardToGraveyard(card, index)
                }}>Send To Graveyard</button>
                <button onClick={() => {
                    sendCardToExile(card, index)
                }} className={styles.drawButton}>Send To Exile</button>
            </div>
        })}
    </div>
    <div className={styles.deck}>
        <img className={styles.cardBack} alt="cardBack" src="/cardBack.png" />
        <button className={styles.drawButton} onClick={() => {
            let updatedShuffledDeck = deckShuffled.slice(0)
            const newCardToAdd = updatedShuffledDeck[0]
            updatedShuffledDeck = updatedShuffledDeck.slice(1)

            setDeckShuffled(updatedShuffledDeck)
            setSampleHand(oldArray => [...oldArray, newCardToAdd])
        }}>Draw Card</button>
        <button className={styles.drawButton} onClick={drawHand}>Draw Hand</button>
        <button className={styles.drawButton} onClick={() => {
            shuffleDeck(deck, true); 
            setSampleHand([])
            setArtifactsEnchantments([])
            setCardsInPlay([])
            setDiscardPile([])
            }}>Shuffle Deck
        </button>
        <button className={styles.drawButton}
        onClick={() => {setLibraryPopup(true)}}>
            Search Library
        </button>
    </div>
    <div className={styles.hand}>
    {sampleHand.map((card, index) => {
        return <div className={styles.card}>
            <Card card={card.card}
        withoutButton={true}
        inHand={true}/>
        <button onClick={() => {
            sampleHand.splice(index, 1)
            playCard(card, index)
        }}>Play Card</button>
        <button className={styles.drawButton} onClick={() => {
            const newSampleHand = sampleHand.slice(0)
            newSampleHand.splice(index, 1) 

            setSampleHand(newSampleHand)
            sendCardToGraveyard(card, index)
        }}>
            Discard Card
        </button>
        <button className={styles.drawButton} onClick={() => {
            const newSampleHand = sampleHand.slice(0)
            newSampleHand.splice(index, 1)

            setSampleHand(newSampleHand)
            sendCardToExile(card, index)
        }}>
            Exile Card
        </button>
        </div>
    })}
    </div>
</div>
}

export default FishBowl
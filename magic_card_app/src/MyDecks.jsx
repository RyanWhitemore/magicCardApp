import axios from "axios"
import { useQuery } from "react-query"
import Header from "./Header"
import styles from "./MyDecks.module.css"
import { useNavigate } from "react-router-dom"


const MyDecks = ({
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

    const user = localStorage.getItem("userID")

    const deckList = useQuery({queryKey: "deckList" + user, refetchOnWindowFocus: false, queryFn: () => {
        return axios.get("http://localhost:5000/deck/" + user)
    }})

    const navigate = useNavigate()

    const openDeck = async (deck) => {
        const deckToOpen = []
        for (const card of deck.cards) {
            console.log(card)
            let cardToAdd = axios.get(`https://api.scryfall.com/cards/${card.card}`) 
            cardToAdd = await cardToAdd
            deckToOpen.push({card: cardToAdd.data, numInDeck: card.numInDeck})
        }

        let commander = "false"

        if (deck.commander) {
            commander = await axios.get(`https://api.scryfall.com/cards/${deck.commander}`)
        }


        localStorage.setItem("deck", JSON.stringify(deckToOpen))
        localStorage.setItem("commander", JSON.stringify(commander.data))
        localStorage.setItem("deckID", deck.deckID)
        localStorage.setItem("deckName", deck.deckName)
        navigate("/deckpage")
    }

    return <>
    <Header setLoginClicked={setLoginClicked}
        loginClicked={loginClicked}
        fromHome={false}
        login={login}
        setUsername={setUsername}
        setPassword={setPassword}
        />
    <header className={styles.header}>Decks</header>
    <div className={styles.decksDiv}>
        {deckList.isFetched && deckList.data.data ? deckList.data.data.map(deck => {
                return <><div className={styles.deckDiv} onClick={() => {
                    openDeck(deck)
                }}>
                                {deck.deckName}{deck?.colorIdentity?.map(color => {
                            return <img alt={color}
                                src={`${color}Pip.png`}
                                height={"13px"}
                                width={"13px"}
                                className={styles.pips}
                            ></img>
                        })}
                    </div></>
            }) : null}
    </div>
    </>
}

export default MyDecks
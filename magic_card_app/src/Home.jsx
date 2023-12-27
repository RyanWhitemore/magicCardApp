import {React, useState} from "react";
import axios from "axios";
import Card from "./Card";
import Header from "./Header";
import styles from "./Home.module.css"
import { useQuery } from "react-query";
import { paginateCards } from "./util";

const Home = ({  
        fromDeckBuilder, 
        addedCards, 
        setAddedCards,
        deckCost,
        setDeckCost,
        chosenDeckType,
        setChosenDeckType,
        chosenColors,
        setChosenColors,
        notChosenColors,
        setCommander,
        setIsCommander,
        isCommander,
        setNotChosenColors,
        commander,
        withoutButton,
        loginClicked,
        setLoginClicked,
        username,
        password,
        setUsername,
        setPassword,
        login,
        defaultCards,
        setDefaultCards,
        setIsCards,
        isCards }) => {

    const User = localStorage.getItem("userID")

    const [ cards, setCards ] = useState([])

    const [ sortValue, setSortValue ] = useState("name")

    const [ isSearched, setIsSearched ] = useState(false)

    const [ paginatedCards, setPaginatedCards ] = useState([])

    const [ page, setPage ] = useState(0)


    let data = useQuery({queryKey: ["defaultCards", [User, sortValue, notChosenColors]], refetchOnWindowFocus: false, queryFn: async () => {
        if (fromDeckBuilder & !isSearched) {
            if (User !=="guest") {
                setIsCards(true)
                let results = axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/getCards/` + User)
                results = await results
                results = sortResults(results)
                setPaginatedCards(paginateCards(results))
                return results 
            }
        } else {
            if (User !=="guest" & !isSearched) {
                setIsCards(true)
                
                let results = axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/getCards/` + User)
                results = await results
                console.log(results)
                results = sortResults(results)
                if (results.length > 0) {
                    setPaginatedCards(paginateCards(results))
                    return results
                } else {
                    setDefaultCards(true)
                    return axios.get("https://api.scryfall.com/sets/woe")
                }
            } else {
                setDefaultCards(true)
                return axios.get("https://api.scryfall.com/sets/woe")
            }
        }
        
    }})


    let setInfo = false

    if (data.isFetched & defaultCards) {
        setInfo = data.data
    }

    let defaultSet = useQuery({queryKey: ["defaultSet", User], refetchOnWindowFocus: false, queryFn: () => {
        console.log("default set called")
        if (setInfo.data) {
            if (setInfo.data.search_uri) {
                setDefaultCards(true)
                return axios.get(setInfo.data.search_uri)
            }
        } else {
            return null
        }
       
    }, enabled: !!setInfo})

    const collectionData = useQuery({queryKey: "ownedCards", refetchOnWindowFocus: false, queryFn: () => {
        if (User !== "guest") {
            return axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/getCards/` + User)
        }
        return
    }})

    if (collectionData.isSuccess && User !== "guest" & data & !defaultCards) {
        if(data.data) {
            for (const card of data.data.data) {
                if (!collectionData.isLoading && collectionData.data) {
                    if (collectionData.data.data.indexOf(card)) {
                        card.inCollection = true
                    }
                }
            }
        }
    }

    const sortResults = (results) => {
        if (sortValue === "name") {
            if (!results) {
                return
            }
            if (results) {
                results = results.data.sort((a, b) => {
                    return a.name.localeCompare(b.name)
                })
            }
        }
        if (sortValue === "value") {
            if (results) {
                results = results.data.sort((a, b) => {
                    if (!a.prices.usd) {
                        return 1
                    }
                    if (!b.prices.usd) {
                        return -1
                    }
                    return b.prices.usd - a.prices.usd
                })
            }
        }

        if (sortValue === "color") {
            if (results) {
                results = results.data.sort((a, b) => {
                    a = a.color_identity.join()
                    b = b.color_identity.join()
                    return b.localeCompare(a)
                })
            }
        }
        if (results.length >= 0 & fromDeckBuilder ) {
            results = results.filter((card) => {
                for (const color of card.color_identity) {
                    if (notChosenColors.indexOf(color) >= 0) {
                        return false
                    }
                }
                return true
            })
        }

        return results
    }
     
    
    if (User === "guest" && defaultSet.isSuccess && fromDeckBuilder) {
        defaultSet = {data: {data: {data: defaultSet.data.data.data.filter(card => {
            if (card === commander) {
                return false
            }
            if (card.color_identity.length === 0) {
                return true
            }
            for (const color of notChosenColors) {
                if (card.color_identity.indexOf(color) >= 0) {
                    return false
                }
            }
            return true
        })}}}
    }
    
    if (defaultSet.error) {
        console.log(defaultSet.error.message)
    
    }
  

    return <>
    <div className={styles.header}>
    <Header 
        setLoginClicked={setLoginClicked}  
        loginClicked={loginClicked} 
        fromHome={true}
        defaultCards={defaultCards}
        setDefaultCards={setDefaultCards}
        cards={cards}
        setCards={setCards}
        setIsSearched={setIsSearched}
        setSortValue={setSortValue}
        sortValue={sortValue}
        setUsername={setUsername}
        setPassword={setPassword}
        login={login}/>
    </div>
    <div id="main">
        {!data.isFetching && isCards && !isSearched && data  ? <div className={styles.cards}>
            {paginatedCards.map((array, index) => {
                return array.map((card) => {
                    if (!chosenDeckType | card.legalities[chosenDeckType] === "legal") {
                        if (page === index) {
                            return <div key={card.id}>
                            <Card
                            cards={isCards}
                            withoutButton={withoutButton}
                            card={card}
                            fromDeckBuilder={fromDeckBuilder}
                            addedCards={addedCards}
                            setAddedCards={setAddedCards}
                            deckCost={deckCost}
                            setDeckCost={setDeckCost}
                            chosenDeckType={chosenDeckType}
                            setChosenDeckType={setChosenDeckType}
                            setCommander={setCommander}
                            setIsCommander={setIsCommander}
                            isCommander={isCommander}
                            setNotChosenColors={setNotChosenColors}
                            notChosenColors={notChosenColors}
                            setChosenColors={setChosenColors}
                            commander={commander}
                            />
                        </div>
                    } else {
                        return null
                    }  
                        }
                })
            })}
            </div> : null}

        {isSearched && fromDeckBuilder ? <div className={styles.cards}>
            {cards.map(card => {
                if (!chosenDeckType | card.legalities[chosenDeckType] === "legal") {
                    if (chosenColors === "all") {
                        return <div key={card.id}> 
                        <Card
                        cards={isCards}
                        withButton={false} 
                        card={card}
                        fromDeckBuilder={fromDeckBuilder}
                        addedCards={addedCards}
                        setAddedCards={setAddedCards}
                        deckCost={deckCost}
                        setDeckCost={setDeckCost}
                        chosenDeckType={chosenDeckType}
                        setChosenDeckType={setChosenDeckType}
                        setCommander={setCommander}
                        setIsCommander={setIsCommander}
                        isCommander={isCommander}
                        setNotChosenColors={setNotChosenColors}
                        setChosenColors={setChosenColors}
                        notChosenColors={notChosenColors}
                        inDeck={false}
                        />
                    </div>
                    }
                    for (const color of card.color_identity) {
                        if (notChosenColors.indexOf(color) >= 0) {
                            return null
                        }
                    }
                    return <div key={card.id}> 
                            <Card
                            cards={isCards}
                            withButton={false} 
                            card={card}
                            fromDeckBuilder={fromDeckBuilder}
                            addedCards={addedCards}
                            setAddedCards={setAddedCards}
                            deckCost={deckCost}
                            setDeckCost={setDeckCost}
                            chosenDeckType={chosenDeckType}
                            setChosenDeckType={setChosenDeckType}
                            setCommander={setCommander}
                            setIsCommander={setIsCommander}
                            isCommander={isCommander}
                            setNotChosenColors={setNotChosenColors}
                            setChosenColors={setChosenColors}
                            notChosenColors={notChosenColors}
                            />
                        </div>
                }
                return null
            })}
        </div> : null}

        {isSearched && !fromDeckBuilder ? <div className={styles.cards}>
            {cards.map(card => {
                if (!chosenDeckType | card.legalities[chosenDeckType] === "legal") {
                    return <div key={card.id}>
                        <Card
                        cards={isCards}
                        withButton={false} 
                        card={card}
                        fromDeckBuilder={fromDeckBuilder}
                        addedCards={addedCards}
                        setAddedCards={setAddedCards}
                        deckCost={deckCost}
                        setDeckCost={setDeckCost}
                        chosenDeckType={chosenDeckType}
                        setChosenDeckType={setChosenDeckType}
                        />
                    </div>
                } else {
                    return null
                }
                
            })}
            </div> : null}
        {!defaultSet.isLoading && defaultSet.status !== "idle" ? <div className={styles.cards}>
                {defaultSet.data.data.data.map(card => {
                    if (!chosenDeckType | card.legalities[chosenDeckType] === "legal") {
                        return <div key={card.id}>
                            <Card 
                            fromDeckBuilder={fromDeckBuilder}
                            addedCards={addedCards}
                            setAddedCards={setAddedCards}
                            card={card}
                            setDeckCost={setDeckCost}
                            deckCost={deckCost}
                            setCommander={setCommander}
                            setIsCommander={setIsCommander}
                            setChosenColors={setChosenColors}
                            setNotChosenColors={setNotChosenColors}
                            chosenDeckType={chosenDeckType}
                            setChosenDeckType={setChosenDeckType}
                            withButton={false}
                            />
                        </div>
                    } else {
                        return null
                    }
                })}
            </div>: null}
        <div className={styles.pageNumbers}>{paginatedCards.map((_, index) => {
            if (!isSearched) {
                return <button className={styles.pageNum} onClick={() => setPage(index)}> {index + 1} </button>
            }
            return null
            
        })}</div>
        {isSearched ? <button onClick={() => setIsSearched(false)}
        className={styles.backButton}>Back</button> : null}
    </div>
    </>
}

export default Home
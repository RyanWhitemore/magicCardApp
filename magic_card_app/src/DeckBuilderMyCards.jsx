import {React, useEffect, useRef, useState} from "react";
import axios from "axios";
import Card from "./Card";
import Header from "./Header";
import styles from "./DeckBuilderMyCards.module.css"
import { useQuery, useInfiniteQuery } from "react-query";
import { paginateCards } from "./util";
import Grid from "@mui/material/Grid"
import { useTheme } from "@emotion/react";
import Box  from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import Stack from '@mui/material/Stack';

const DeckBuilderMyCards = ({  
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
        isCards,
        divRef }) => {

    const User = localStorage.getItem("userID")

    const [ cards, setCards ] = useState([])

    const [ sortValue, setSortValue ] = useState("name")

    const [ isSearched, setIsSearched ] = useState(false)

    const [ paginatedCards, setPaginatedCards ] = useState([])

    const [ page, setPage ] = useState(0)

    const [ totalPages, setTotalPages ] = useState(1)

    const theme = useTheme()

    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"))
    const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "lg"))

    let data = useQuery({queryKey: ["defaultCards", [User, sortValue, notChosenColors]], refetchOnWindowFocus: false, queryFn: async () => {
        setDefaultCards(false)
        if (fromDeckBuilder & !isSearched) {
            if (User !=="guest") {
                setIsCards(true)
                let results = axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/getCards/` + User)
                results = await results
                setTotalPages(Math.ceil(results.data.length / 75))
                results = sortResults(results)
                setPaginatedCards(paginateCards(results))
                return results 
            }
        } else {
            setDefaultCards(true)
            return axios.get("https://api.scryfall.com/sets/LCI")
        }
        
    }})
    

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
     

    return <Box>
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
        login={login}
        fromDeckBuilder={fromDeckBuilder}
    /> 
    <div style={{
        backgrounColor: theme.palette.background.default,
    }}>
        {!data.isFetching && isCards && !isSearched && data  ? <Grid 
            justifyContent={"center"} 
            container spacing={isSmallScreen ? 1 : 3}>
            {paginatedCards.map((array, index) => {
                return array.map((card) => {
                    if (!chosenDeckType | card.legalities[chosenDeckType] === "legal") {
                        if (page === index) {
                            return <Grid item  key={card.id}>
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
                        </Grid>
                        } else {
                            return null
                        }  
                    } else {
                        return null
                    }
                })
            })}
            </Grid> : null}

        {isSearched && fromDeckBuilder ? <Grid container
            justifyContent="center"
            spacing={isSmallScreen ? 1 : 3}
        >
            {cards.map(card => {
                if (!chosenDeckType | card.legalities[chosenDeckType] === "legal") {
                    if (chosenColors === "all") {
                        return <Grid item key={card.id}> 
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
                    </Grid>
                    }
                    for (const color of card.color_identity) {
                        if (notChosenColors.indexOf(color) >= 0) {
                            return null
                        }
                    }
                    return <Grid item key={card.id}> 
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
                        </Grid>
                }
                return null
            })}
        </Grid> : null}

        {isSearched && !fromDeckBuilder ? <Grid 
            className={styles.cards}
            container
            justifyContent="center"
            spacing={isSmallScreen ? 1 : 3}
        >
            {cards.map(card => {
                if (!chosenDeckType | card.legalities[chosenDeckType] === "legal") {
                    return <Grid key={card.id}>
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
                    </Grid>
                } else {
                    return null
                }
                
            })}
            </Grid> : null}
        { fromDeckBuilder ? <div className={styles.pages}>
            <Stack spacing={2}>
                <Pagination
                    count={totalPages}
                    onChange={(e, page) => {
                        setPage(page - 1)
                        divRef.current.scroll({
                            top: 0,
                            behavior: "smooth"
                        })
                    }}
                />
            </Stack>
        </div> : null}
        {isSearched ? <button onClick={() => setIsSearched(false)}
        className={styles.backButton}>Back</button> : null}
    </div>
    </Box>
}

export default DeckBuilderMyCards
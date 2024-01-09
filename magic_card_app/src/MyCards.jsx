import axios from "axios"
import Card from "./Card"
import Header from "./Header"
import "./MyCards.css"
import { useQuery } from "react-query"
import { useState } from "react"
import { paginateCards } from "./util"
import Grid from "@mui/material/Grid"
import { useTheme } from "@emotion/react"
import { useMediaQuery } from "@mui/material"


const MyCards = ({
    search, setSearch,
    loginClicked, setLoginClicked,
    username, password,
    setUsername, setPassword,
    login, defaultCards,
    setDefaultCards, isCards,
    setIsCards
    }) => {

    const userID = localStorage.getItem("userID")

    const [ sortValue, setSortValue ] = useState("name")

    const [ cards, setCards ] = useState([])

    const [ isSearched, setIsSearched ] = useState(false)

    const [ pageNumber, setPageNumber ] = useState(0)

    const theme = useTheme()

    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"))
    const isMediumScreen = useMediaQuery(theme.breakpoints.between("md", "lg"))

    let { data, isFetching } = useQuery({queryKey: ["myCardData", [sortValue]], refetchOnWindowFocus: false, queryFn: () => {
        if (userID !== "guest") {
            return axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/getCards/${userID}`).then((res) => {
            res = sortResults(res)
            const paginatedCards = paginateCards(res)
            setCards(paginatedCards)
            return paginatedCards
            })
        }
        
    }, enabled: userID !== "guest"}, [sortValue, pageNumber])



    const sortResults = (results) => {
        if (sortValue === "name") {
            if (results) {
                results = results.data.sort((a, b) => {
                    return a.name.localeCompare(b.name)
                })
            }
        }
    
        if (sortValue === "value") {
            if (results) {
                results = results.data.sort((a, b) => {
                    if (a.prices.usd === null) {
                        return 1
                    }
                    if (b.prices.usd === null) {
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
        return results
    }



    const getCollectionTotalPrice = () => {
        let totalCollectionPrice = 0.00
        if (!isFetching && userID !== "guest" && data) {
            for (const page of data) {
                for (const card of page) {
                    if (card.prices.usd) {
                        totalCollectionPrice = 
                        (parseFloat(card.prices.usd) * parseFloat(card.quantity))+ 
                        parseFloat(totalCollectionPrice)
                        totalCollectionPrice = totalCollectionPrice.toFixed(2)
                    } 
                } 
            }
        }
        return totalCollectionPrice
    }

    const newTotal = getCollectionTotalPrice()
    return <>
        
        <Header fromHome={false}
            collectionTotalPrice={newTotal}
            fromMyCards={true}
            setCards={setCards}
            cards={cards}
            setIsSearched={setIsSearched}
            setSortValue={setSortValue}
            sortValue={sortValue}
            loginClicked={loginClicked}
            setLoginClicked={setLoginClicked}
            setUsername={setUsername}
            setPassword={setPassword}
            login={login}
        />
        <div>
            {userID !== "guest" && !isFetching && !isSearched ? 
                <Grid 
                    container
                    spacing={isSmallScreen ? 1 : 3}
                    alignItems="center"
                    justifyContent="center">{data.map((page, index) => {
                    return page.map((card) => {
                        if (index === pageNumber) {
                            return <Grid item>
                                        <Card 
                                        key={card.id}
                                        withoutButton={true} 
                                        card={card}
                                        withDeleteButton={true}
                                        fromMyCards={true}
                                        userID={userID}
                                        search={search}
                                        setSearch={setSearch}
                                        cards={cards}/>
                                </Grid>
                        }
                        return null
                    })
            })}</Grid> : null}
            {userID !== "guest" & !isFetching & isSearched ? 
                <div className="cards">{cards.data.map(card => {
                    return <Card 
                        key={card.id}
                        withButton={false} 
                        card={card}
                        withDeleteButton={true}
                        fromMyCards={true}
                        userID={userID}
                        search={search}
                        setSearch={setSearch}
                        cards={cards}/>
                })}
                </div>: null}                
            {(!isSearched & !isFetching > 0) && <div className="buttonDiv">
                {data.map((_, index) => {
                return <button 
                    className={"pageButton"}
                    onClick={() => setPageNumber(index)}>
                        {index + 1}
                    </button>
                })}
            </div>}
        </div>
        {isSearched && <div><button onClick={() => setIsSearched(false)}>Back</button></div>}
    </>
}

export default MyCards
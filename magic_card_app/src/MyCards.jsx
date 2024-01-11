import axios from "axios"
import Card from "./Card"
import Header from "./Header"
import "./MyCards.css"
import { useQuery } from "react-query"
import { useState } from "react"
import { paginateCards, sortResults } from "./util"
import Grid from "@mui/material/Grid"
import { useTheme } from "@emotion/react"
import Button from "@mui/material/Button"
import Pagination from "@mui/material/Pagination"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import Box from "@mui/material/Box"
import { useNavigate } from "react-router-dom"
import Filter from "./Filter"


const MyCards = ({
    search, setSearch,
    loginClicked, setLoginClicked,
    setUsername, setPassword,
    login,
    }) => {
    
    const userID = localStorage.getItem("userID")
    
    const [ sortValue, setSortValue ] = useState("name")
    
    const [ filter, setFilter ] = useState([])
    
    const [ sets, setSets ] = useState([])

    const [ totalSetColInfo, setTotalSetColInfo ] = useState([])
    
    const [ cards, setCards ] = useState([])
    
    const [ isSearched, setIsSearched ] = useState(false)
    
    const [ pageNumber, setPageNumber ] = useState(1)
    
    const [ filterClicked, setFilterClicked ] = useState(false)
    
    const [ filterSetParams, setFilterSetParams ] = useState(false)

    const theme = useTheme()
    
    const navigate = useNavigate()
    
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"))
    const isMediumScreen = useMediaQuery(theme.breakpoints.between("md", "lg"))
    
    let { data, isFetching } = useQuery({queryKey: ["myCardData"], refetchOnWindowFocus: false, queryFn: () => {
        if (userID !== "guest" && !filterSetParams) {
            return axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/getCards/${userID}`).then((res) => {
            res = sortResults(res.data, sortValue)
            const paginatedCards = paginateCards(res)
            setCards(paginatedCards)
            return paginatedCards
            })
        }
    
    }, enabled: userID !== "guest"}, [sortValue])

    useQuery({queryKey: ["set-info"], refetchOnWindowFocus: false, queryFn: async () => {
        setSets([{label: "All Sets", value: false}])
        let results = await axios.get("https://api.scryfall.com/sets")
        results = results.data.data.sort((a, b) => {
            return b.released_at - a.released_at
        })
        for (const set of results) {
            setSets(oldArray => [...oldArray, {label: `${set.name} [${set.code}]`, value: set.search_uri}])
        }
        return results 
    }, enabled: filter.indexOf("Set") >= 0})


    useQuery({queryKey: ["filter-set", [filterSetParams]], refetchOnWindowFocus: false, queryFn: async () => {
        let allSetCards = []
        let result = {}
        let fetchedSetCards = await axios.get(filterSetParams)
        allSetCards = [...allSetCards, fetchedSetCards.data.data]
        while (fetchedSetCards.data.has_more) {
            fetchedSetCards = await axios.get(fetchedSetCards.data.next_page)
            allSetCards = [...allSetCards, fetchedSetCards.data.data]
        }
        allSetCards = allSetCards.flat()
        result.data = data.flat()
        let filteredSetData = cards.flat()

        filteredSetData = filteredSetData.filter((obj1) => {
            return allSetCards.some((obj2) => {
                return obj1.id === obj2.id
            })
        })

        result = allSetCards.filter((obj1) => {
            return result.data.some((obj2) => {
                return obj1.id === obj2.id
            })
        }) 
    
        filteredSetData = sortResults(filteredSetData, sortValue)
        filteredSetData = paginateCards(filteredSetData)

        setTotalSetColInfo(result)
        setCards(filteredSetData)

    }, enabled: filterSetParams !== false})


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
        <Box sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px"
        }}>
            <Button sx={{
                marginRight: "30px"
            }}
                variant="contained"
                onClick={() => {
                    setFilterClicked(true)
                }}
            >
                Filter
            </Button>
            <Filter 
                setCards={setCards}
                data={data}
                sets={sets}
                totalSetColInfo={totalSetColInfo}
                sortValue={sortValue}
                filter={filter}
                setFilter={setFilter}
                filterClicked={filterClicked}
                setFilterClicked={setFilterClicked}
                filterSetParams={filterSetParams}
                setFilterSetParams={setFilterSetParams}
            />
        </Box>
        <div>
            {userID !== "guest" && !isFetching && !isSearched ? 
                <Grid 
                    container
                    spacing={isSmallScreen ? 1 : 3}
                    alignItems="center"
                    justifyContent="center">{cards.length > 0 ? cards.map((page, index) => {
                        return page.map((card) => {
                            if (index + 1 === pageNumber) {
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
                                                cards={cards}
                                                numCollected={card.quantity}/>
                                    </Grid>
                            }
                        return null
                    })
            }) : <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}>
                    <Typography variant="h4">No Cards Collected in This Set</Typography>
                    <Button
                        onClick={() => {
                            navigate("/addcards", {state: filterSetParams ? {setParam: filterSetParams} : null})
                        }}
                    >
                        {`${filterSetParams ? "Add Cards From This Set" : "Add Cards"}`}
                    </Button>
                </Box>}</Grid> : null}
            {(userID !== "guest" & !isFetching & isSearched) ? 
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
                        cards={cards}
                        numCollected={card.quantity}
                        />
                })}
                </div>: null}                
            {(!isSearched & !isFetching > 0) ? <Box sx={{
                display: "flex",
                justifyContent: "center",
            }}>
                    <Pagination 
                        count={cards.length}
                        onChange={(e, page) => setPageNumber(page)} 
                    />
                </Box> 
            :null}
        </div>
        {isSearched && <div><button onClick={() => {
            setIsSearched(false);
            setCards(data)
        }}>Back</button></div>}
    </>
}

export default MyCards
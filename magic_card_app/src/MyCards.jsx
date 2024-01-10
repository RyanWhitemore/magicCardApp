import axios from "axios"
import Card from "./Card"
import Header from "./Header"
import "./MyCards.css"
import { useQuery } from "react-query"
import { useState } from "react"
import { paginateCards } from "./util"
import Grid from "@mui/material/Grid"
import { useTheme } from "@emotion/react"
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Button, Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText, Pagination, TextField, Typography, useMediaQuery } from "@mui/material"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import { sortResults } from "./util"
import { useNavigate } from "react-router-dom"
import List from "@mui/material/List"


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
    
    const [ checked, setChecked ] = useState([])
    
    const [ isSearched, setIsSearched ] = useState(false)
    
    const [ pageNumber, setPageNumber ] = useState(1)
    
    const [ filterClicked, setFilterClicked ] = useState(false)
    
    const [ filterSetParams, setFilterSetParams ] = useState(false)

    const [ colorsNotChecked, setColorsNotChecked ] = useState(["White", "Blue", "Black", "Red", "Green", "Colorless"])

    const [ typeChecked, setTypeChecked ] = useState([])
    
    const filterOptions = ["Set", "CMC", "Colors", "Type"]

    const colorFilterOptions = ["White", "Blue", "Black", "Red", "Green", "Colorless"]

    const colorObj = {"White": "W", "Blue": "U", "Black": "B", "Red": "R", "Green": "G", "Colorless": true}
    
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
        result.data = allSetCards
    
        let allCards = filterCards(null, null, true)
        allCards = allCards.flat()

        result = allCards.filter((obj1) => {
            return result.data.some((obj2) => {
                return obj1.id === obj2.id
            })
        }) 
    
        result = sortResults(result, sortValue)
        result = paginateCards(result)

        setTotalSetColInfo(result)
        setCards(result)
    
    }, enabled: filterSetParams !== false})

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value)
        const newChecked = [...checked]
        
        if (currentIndex === -1) {
            newChecked.push(value)
        } else {
            newChecked.splice(currentIndex, 1)
        }
        setChecked(newChecked)
    } 

    const filterCards = (e, val, fromSetFilter = false) => {
        let newCards
        if (filterSetParams && !fromSetFilter) {
            newCards = totalSetColInfo.flat()
        } else {
            newCards = data.flat()
        }


        newCards = filterCmc(newCards, val)

        newCards = filterColors(newCards, val)

        if (typeChecked.length > 0) {
            newCards = newCards.slice()
        }

        newCards = sortResults(newCards, sortValue)
        newCards = paginateCards(newCards)

        setCards(newCards)
        console.log(newCards)
        return newCards
    }
   

    const filterCmc = (cards, val) => {
        let cardsToReturn = cards.slice()
        const currentIndex = checked.indexOf(val)
        
        let newChecked = checked.slice()
        if (typeof val === "number") {
            if (currentIndex >= 0) {
                newChecked.splice(currentIndex, 1)
            } else {
                newChecked.push(val)
            }
            setChecked(newChecked)
        }

        if (newChecked.length === 0) {
            return cardsToReturn
        }
 
        cardsToReturn = cardsToReturn.filter((card) => {
            if (newChecked.indexOf(card.cmc) >= 0) {
                return true
            } else {
                return false
            }
        })

        return cardsToReturn
    }

    const filterColors = (newCards, val) => {
        let cardsToReturn = newCards.slice()
        const currentIndex = colorsNotChecked.indexOf(val)

        let newNotColors = colorsNotChecked.slice()
        if (colorFilterOptions.indexOf(val) >= 0) {
            if (currentIndex >= 0) {
                newNotColors.splice(currentIndex, 1)
            } else {
                newNotColors.push(val)
            }
            setColorsNotChecked(newNotColors)
        }

        if (newNotColors.length === 6) {
            return cardsToReturn
        }

        cardsToReturn = cardsToReturn.filter((card) => {
            if (card.color_identity.length === 0 && newNotColors.indexOf("Colorless") >= 0) {
                return false
            }
            for (const color of newNotColors) {
                if (card.color_identity.indexOf(colorObj[color]) >= 0) {
                    return false
                }
            }
            return true
        })
        
        return cardsToReturn
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
            
        </Box>
        <Drawer
            open={filterClicked}
            onClose={() => {setFilterClicked(false)}}
            anchor="right"
            PaperProps={{sx: {
                width: "300px"
            }}}
        >
            {filterOptions.map((text) => {
                return <Accordion
                    onChange={(e, expanded) => {
                        if (expanded) {
                            setFilter(oldArray => [...oldArray, text])
                        } else {
                            const newArray = [...filter]
                            const indexToRemove = newArray.indexOf(text)
                            if (indexToRemove === -1) {
                                return
                            } else {
                                newArray.splice(indexToRemove, 1)
                                setFilter(newArray)
                            }
                        }
                    }}
                >
                    <AccordionSummary>{text}</AccordionSummary>
                        <AccordionDetails>
                            {text === "Set" ? <Autocomplete
                                onChange={(e, val) => {
                                    if (val) {
                                        if (!val.value) {
                                            let newArray = data.flat()
                                            newArray = sortResults(newArray, sortValue)
                                            newArray = paginateCards(newArray)
                                        
                                            setCards(newArray)
                                        }
                                        setFilterSetParams(val.value)
                                    }
                                }} 
                                options={sets}
                                freeSolo
                                id="set-search"
                                clearOnEscape
                                renderInput={(params) => <>
                                    <TextField {...params}
                                        inputProps={{
                                            ...params.inputProps,
                                            onKeyDown: (e) => {
                                                if (e.key === "Enter") {
                                                    e.stopPropagation()
                                                }
                                            }
                                        }}
                                        label="Search Sets"  
                                    />
                                </> }
                            /> : text === "CMC" ? <List>
                                <Box sx={{
                                    display: "flex"
                                }}>
                                    <List>
                                        {Array(8).fill(0).map((_, num) => {
                                            const labelId = `checkbox-cmc-label${num + 1}`
                                            return <ListItem
                                                key={`CMC${num + 1}`}
                                                disablePadding
                                            >
                                                <ListItemButton onClick={handleToggle(num + 1)}>
                                                    <ListItemIcon>
                                                        <Checkbox 
                                                            onClick={(e) => filterCards(e, num + 1)}
                                                            edge="start"
                                                            checked={checked.indexOf(num + 1) >= 0}
                                                            tabIndex={-1}
                                                            disableRipple
                                                            inputProps={{"aria-labeledby": labelId}}
                                                        />
                                                    </ListItemIcon>
                                                    <ListItemText id={labelId} primary={`${num + 1}`}/>
                                                </ListItemButton>
                                            </ListItem>
                                        })}
                                    </List>
                                    <List sx={{
                                        paddingLeft: "70px"
                                    }}>
                                        {Array(8).fill(0).map((_, num) => {
                                            const labelId = `checkbox-cmc-label${num + 9}`
                                            return <ListItem
                                            key={`CMC${num + 9}`}
                                            disablePadding
                                        >
                                            <ListItemButton onClick={handleToggle(num + 9)}>
                                                <ListItemIcon>
                                                    <Checkbox 
                                                        onClick={(e) => filterCards(e, num + 9)}
                                                        edge="start"
                                                        checked={checked.indexOf(num + 9) >= 0}
                                                        tabIndex={-1}
                                                        disableRipple
                                                        inputProps={{"aria-labeledby": labelId}}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText id={labelId} primary={`${num + 9}${(num + 9 === 16 ? "+" : "")}`}/>
                                            </ListItemButton>
                                        </ListItem>
                                        })} 
                                    </List>
                                </Box>
                            </List> : text === "Colors" ? <List>
                                {colorFilterOptions.map((color) => {
                                    const labelId = `checkbox-color-label-${color}`
                                    return <ListItem>
                                        <ListItemButton onClick={(e) => {filterCards(e, color)}}>
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={colorsNotChecked.indexOf(color) === -1}
                                                    tabIndex={-1}
                                                    disableRipple
                                                    inputProps={{"aria-labeledby": labelId}} 
                                                />
                                            </ListItemIcon>
                                            <ListItemText id={labelId} primary={color} />
                                        </ListItemButton>
                                    </ListItem>
                                })}
                            </List> : text}
                        </AccordionDetails>
                </Accordion>
            })}
        </Drawer>
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
        {isSearched && <div><button onClick={() => setIsSearched(false)}>Back</button></div>}
    </>
}

export default MyCards
import axios from "axios"
import { useEffect, useState } from "react"
import { useInfiniteQuery, useQuery } from "react-query"
import Card from "./Card"
import Grid from "@mui/material/Grid"
import Header from "./Header"
import CircularProgress from "@mui/material/CircularProgress"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Typography from "@mui/material/Typography"
import Autocomplete from "@mui/material/Autocomplete"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import { createFilterOptions } from "@mui/material/Autocomplete"
import { useMediaQuery } from "@mui/material"
import { useTheme } from "@emotion/react"
import Button from "@mui/material/Button"
import { useLocation } from "react-router-dom"

const AddCards = () => {

    const location = useLocation()

    const userID = localStorage.getItem("userID")

    const [ sets, setSets ] = useState([])

    const [ setSearchParams, setSetSearchParams ] = useState(location.state ? location.state.setParam : "https://api.scryfall.com/cards/search?include_extras=true&include_variations=true&order=set&q=e%3Alci&unique=prints")

    const [ searchedCards, setSearchedCards ] = useState(false)

    const theme = useTheme()

    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"))
    const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "lg"))

    const OPTIONS_LIMIT = 20;
    const defaultFilterOptions = createFilterOptions();
    
    const filterOptions = (options, state) => {
      return defaultFilterOptions(options, state).slice(0, OPTIONS_LIMIT);
    };
    
    const fetchPage = async (page) => {
        return await axios.get(page)
    }

    const data = useQuery({queryKey: "collection-data", refetchOnWindowFocus: false, queryFn: async () => {
        const results = await axios.get(`http://localhost:5000/getCards/${userID}`)
        return results
    }})

    useQuery({queryKey: ["set-data", [setSearchParams]], refetchOnWindowFocus: false, queryFn: async () => {
        setSets([])
        let results = await axios.get("https://api.scryfall.com/sets")
        results = results.data.data.sort((a, b) => {
            return b.released_at - a.released_at
        })
        for (const set of results) {
            setSets(oldArray => [...oldArray, {label: `${set.name} [${set.code}]`, value: set.search_uri},])
        }
        return results
    }})

    const {
        fetchNextPage,
        fetchPreviousPage,
        hasNextPage,
        hasPreviousPage,
        isFetchingNextPage,
        isFetchingPreviousPage,
        ...result
    } = useInfiniteQuery({
     queryKey: ["default cards", [setSearchParams]],
     queryFn: ({pageParam = setSearchParams}) => fetchPage(pageParam),
     getNextPageParam: (lastPage, allPages) => lastPage.data.next_page
    })

    useEffect(() => {

        const handleScroll = () => {
            if (document.documentElement.offsetHeight - (window.innerHeight + document.documentElement.scrollTop) <= 50) {
                fetchNextPage()
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
        }, [fetchNextPage])

        return <div style={{
            display: "flex",
            flexDirection: "column"
    }}>
        <Header
            fromAddCards={true}
            searchedCards={searchedCards}
            setSearchedCards={setSearchedCards}
        />
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                marginBottom: "70px"
            }}>
                <Accordion sx={{
                    width: "300px"
                }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                    >  
                        <Typography>Search Sets</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography sx={{
                            marginBottom: "5px",
                        }}
                        >
                            Select From List
                        </Typography>    
                        <Autocomplete
                            onChange={(e, val) => {
                                if (val) {
                                    setSetSearchParams(val.value)
                                }
                            }}
                            filterOptions={filterOptions}
                            id="set-search" 
                            freeSolo
                            clearOnEscape
                            options={sets}
                            renderInput={(params) => <>
                                <TextField {...params}
                                    inputProps={{
                                        ...params.inputProps,
                                        onKeyDown: (e) => {
                                            if (e.key === "Enter") {
                                                e.stopPropagation();
                                            }
                                        }
                                    }}
                                    label="Search Sets"
                                />
                            </>}
                        />
                    </AccordionDetails>
                </Accordion>
            </Box>
            {result.isLoading ? <CircularProgress /> : null}
            { !searchedCards ? <Grid sx={{
                    justifyContent: "center"
                }} 
                container
                spacing={ isSmallScreen ? 1 : 3}
            >
                {!result.isLoading ? result.data.pages.map((page) => {
                    return page.data.data.map((card) => {
                        let inCollection = []
                        if (!data.isFetching) {
                            inCollection = data.data.data.filter(obj => {
                                return obj.id === card.id
                            }) 
                        }
                        const numInColl = inCollection.length > 0 ? inCollection[0].quantity : 0
                        if (!data.isFetching) {
                            return <Grid item>
                            <Card
                                inCollection={
                                    inCollection.length > 0 ? true : false
                                }
                                numCollected={numInColl}
                                fromAddCards={true}
                                card={card}
                                key={numInColl}
                            />
                        </Grid> 
                        } else {
                            return null
                        }
                    })
                }) : null}  
            </Grid> : <>
                <Grid
                    container
                    spacing={3}
                    sx={{
                        justifyContent: "center"
                    }}
                >
                    {searchedCards.map((card) => {
                        const inCollection = searchedCards.filter(obj => {
                            return obj.id === card.id
                        })
                        const numInColl = inCollection.length > 0 ? inCollection[0].quantity : 0   
                        return <Grid item>
                            <Card 
                                inCollection={inCollection.length > 0 ? true : false}
                                numCollected={numInColl}
                                fromAddCards={true}
                                card={card}
                            />
                        </Grid>
                    })}
                </Grid>
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                }}>
                    <Button 
                    variant="contained" size="small"
                    onClick={() => setSearchedCards(false)}
                    >
                        Back
                    </Button>
                </Box>
            </>}
            {isFetchingNextPage ? <CircularProgress /> : null}  
        </div>

}

export default AddCards
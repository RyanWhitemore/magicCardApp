import axios from "axios"
import { useQuery } from "react-query"
import Header from "./Header"
import styles from "./MyDecks.module.css"
import { useNavigate } from "react-router-dom"
import Popup from "reactjs-popup"
import { useRef, useState } from "react"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { useOutsideAlerter } from "./util"
import CircularProgress from "@mui/material/CircularProgress"
import Card from "@mui/material/Card"
import CardMedia from "@mui/material/CardMedia"
import CardContent from "@mui/material/CardContent"
import Dialog from "@mui/material/Dialog"
import TextField from "@mui/material/TextField"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material"


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
    const [ deckName, setDeckName ] = useState(false)
    const [ notChosenColors, setNotChosenColors ] = useState(["W", "U", "B", "R", "G"])
    const [ popup, setPopup ] = useState(false)

    const createDeckRef = useRef()

    const typesOfDecks = ["commander",
        "modern","pauper","standard","future",
        "historic","gladiator","pioneer","explorer",
        "legacy","vintage","penny","oathbreaker",
        "brawl","historicbrawl","alchemy","paupercommander",
        "duel","oldschool","premodern","predh"]

    const colors = ["White", "Blue", "Black", "Red", "Green"]
    const filterColors = [...colors, "Colorless"]
    const colorObj = {White: "W", Blue: "U", Black: "B", Red: "R", Green: "G"}

    const chipColors = {
        "White": "rgb(255, 251, 213)", 
        "Blue": "rgb(187, 216, 230)", 
        "Black": "rgb(203, 194, 191)",
        "Red": "rgb(249, 170, 143)",
        "Green": "rgb(155, 211, 174)"
    }

    const colorsObj = {"White": "W", "Blue": "U", "Black": "B", "Red": "R", "Green": "G"}

    const deckList = useQuery({queryKey: "deckList" + user, refetchOnWindowFocus: false, queryFn: () => {
        return axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/deck/` + user)
    }})

    const defaultDeckName = "New Deck(" + (deckList.isFetched  && deckList.data.data ? deckList.data.data.filter((deck) => {
        if (deck.deckName?.match(/[Deck Name]/)) {
            return true
        }
        return false
    }).length + 1 + ")": null)

    const navigate = useNavigate()

    const getDeck = async (deck) => {
        console.time("get deck")
        let deckToOpen = []
        const returnArray = []
        
        const { chunks, quantities } = breakIntoChunks(deck)
        console.time("post request")
        for (const chunk of chunks) {
            const result = await axios.post("https://api.scryfall.com/cards/collection", chunk, {
                "Content Type": "application/json"
            })
            deckToOpen = deckToOpen.concat(result.data.data)
        }
        console.timeEnd("post request")
        
        for (const card of deckToOpen) {
            returnArray.push({card, quantity: quantities[card.id]})
        }

        console.timeEnd("get deck")
        return returnArray
    }

    const getCommander = async (commander) => {

        console.time('commander')
        const commanderToAdd = await axios.get(`https://api.scryfall.com/cards/${commander}`)
        console.timeEnd("commander")
        return commanderToAdd
    }

    const setUpDeck = (deck, deckToOpen, commander) => {
        try {
            console.time("setUpDeck")
            localStorage.setItem("deck", JSON.stringify(deckToOpen))
            if(commander) {
                localStorage.setItem("commander", JSON.stringify(commander.data))
            } else {
                localStorage.setItem("commander", JSON.stringify(false))
            }
            localStorage.setItem("deckID", deck.deckID)
            localStorage.setItem("deckName", deck.deckName)
            localStorage.setItem("deckType", deck.deckType)
            localStorage.setItem('deckColorIdentity', JSON.stringify(deck.colorIdentity))
            console.timeEnd("setUpDeck")
            return true
        } catch (err) {
            console.log(err)
        }
    }

    const breakIntoChunks = (deck) => {
        console.time("chunks")
        const returnValue = {}
        const chunks = []
        const quantityObj = {}
        let tempObj = {identifiers: []}
        let finalChunkObj = {identifiers: []}

        for (let card of deck.cards) {
            tempObj.identifiers.push({id: card.card})
            if (tempObj.identifiers.length > 75){
                chunks.push(finalChunkObj)
                finalChunkObj = {identifiers: []}
                tempObj={identifiers : []}
            }
            quantityObj[card.card] = card.quantity
            finalChunkObj.identifiers.push({id: card.card})
        }

        if (finalChunkObj.identifiers.length > 0) {
            chunks.push(finalChunkObj)
        }

        returnValue.chunks = chunks
        returnValue.quantities = quantityObj
        console.timeEnd("chunks")

       return returnValue
    }

    const openDeck = async (deck) => {
        console.time("openDeck")
        const deckToOpen = await getDeck(deck)

        let commander = false

        if (deck.commander) {
            commander = await getCommander(deck.commander)
        }

        if (setUpDeck(deck, deckToOpen, commander)) {
            console.timeEnd("openDeck")
            return navigate("/deckpage")
        }
    }

    const createDeckID = () => {
        const chars = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ1234567890'

        let deckID = ''

        for (let i = 0; i < 20; i++) {
            const charIndex = Math.floor(Math.random() * chars.length)
            deckID = deckID + chars[charIndex]
        }
        return deckID
    }

    const handleColorChange = (e) => {
        let currentNotChosenColors = notChosenColors

        if (e.target.checked) {
            if (currentNotChosenColors.length === 0) {
                currentNotChosenColors = notChosenColors.filter((color) => {
                    if (color === e.target.value) {
                        return true
                    } else {
                        return false
                    }
                })
                setNotChosenColors(currentNotChosenColors)
            } else {
                currentNotChosenColors = notChosenColors.filter((color) => {
                    if (color === e.target.value) {
                        return false
                    } else {
                        return true
                    }
                    
                })
                setNotChosenColors(currentNotChosenColors)
            }
        } else {
            currentNotChosenColors.push(e.target.value)
            setNotChosenColors(currentNotChosenColors)
        }

        
    }

    const createDeck = () => {
        console.log("called")
        const deckID = createDeckID()

        localStorage.setItem("deckID", deckID)
        localStorage.setItem("deck", JSON.stringify([]))
        localStorage.setItem("commander", JSON.stringify(false))
        if (deckName) {
            localStorage.setItem("deckName", deckName)
        } else {
            localStorage.setItem("deckName", defaultDeckName)
        }
        localStorage.setItem("notChosenColors", JSON.stringify({data: notChosenColors}))

        navigate("/deckbuilder")
    }

    return <>
    <Header setLoginClicked={setLoginClicked}
        loginClicked={loginClicked}
        fromHome={false}
        login={login}
        setUsername={setUsername}
        setPassword={setPassword}
        />
    <div >
        <Dialog
            open={popup}
            onClose={() => setPopup(false)}
            PaperProps={{
                component: "form",
                onSubmit: (e) => {
                    e.preventDefault();
                    createDeck()
                    setPopup(false)
                },

            }}
        >
            <DialogTitle>Create Deck</DialogTitle>
            <DialogContent>
                <Grid spacing={5} container>
                    <Grid item>
                        <TextField 
                            autoFocus
                            margin="dense"
                            id="deck name"
                            name="name"
                            defaultValue={defaultDeckName}
                            fullWidth
                            onChange={(e) => setDeckName(e.target.value)}
                            variant="standard"
                        />
                    </Grid>
                    <Grid item>
                        <Select
                            labelId="deck-type-selector"
                            id="deck-type"
                            onChange={(e) => localStorage.setItem("deckType", e.target.value)}
                            defaultValue={"commander"}
                        >
                            {typesOfDecks.map((type) => {
                                return <MenuItem value={type}>{type}</MenuItem>
                            })}
                        </Select>
                    </Grid>
                </Grid>
                <Grid container sx={{
                    alignItems: "flex-end"
                }}>
                    <Grid item xs={7.8}>
                        <FormGroup>
                                {colors.map((color) => {
                                    return <FormControlLabel control={<Checkbox />} label={color} />
                                })}
                        </FormGroup>
                    </Grid>
                    <Grid item>
                        <Button onClick={createDeck}>Create Deck</Button>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
        <Popup open={popup}
            modal
        >
            <div className={styles.creationMenu}>
                <input onChange={(e) => setDeckName(e.target.value)} 
                    className={styles.deckName}
                    defaultValue={defaultDeckName}
                ></input>
                <div className={styles.typeLabel}>
                    <label htmlFor="types">Deck Type</label>
                </div>
                <div id="types" className={styles.typeMenu}>
                    <select className={styles.dropdown}
                        onChange={(e) => localStorage.setItem("deckType", e.target.value)}
                    >
                        {typesOfDecks.map((type) => {
                            return <option value={type}>{type}</option>
                        })}
                    </select>
                </div>
                <div className={styles.colorLabel}>
                    <label htmlFor="colors">Deck Colors</label>
                </div>
                <div id="colors" className={styles.colorMenu}>
                    {colors.map(color => {
                        return <div className={styles.check}>
                            <input onChange={handleColorChange} id={color} type="checkbox" value={colorsObj[color]}/>
                            <label htmlFor={color}>{color}</label>
                        </div>
                    })}
                </div>
                <button className={styles.createButton} onClick={createDeck}>Create Deck</button>
            </div>
        </Popup>
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%"
        }}>
            <Typography
                variant="h2"
            >My Decks</Typography>
            <Button
                sx={{
                    marginTop: "10px"
                }}
                ref={createDeckRef}
                variant="contained"
                onClick={() => setPopup(true)}
            >
                Create Deck
            </Button>
        </Box>
        <Grid container
            spacing="10"
            sx={{
                justifyContent: "center",
                marginTop: "10px",
            }}
        >
            {!deckList.isLoading ? deckList.data.data.map((deck) => {
                return <Grid item>
                        <Card
                            onClick={() => {
                                openDeck(deck)
                            }}
                            elevation={24}
                            sx={{
                                cursor: "pointer",
                                borderRadius: "20px"
                            }}
                        >
                            <CardMedia 
                                component={"img"}
                                image={deck.deckImg}
                                alt={deck.deck_name}
                                height="200"
                            />
                            <CardContent>
                                <div className={styles.manaChip}
                                    style={{
                                        backgroundColor: deck.totalManaPips.total === 0 ? "gray" : null
                                    }}
                                >
                                    {colors.map((color) => {
                                        const width = (deck.totalManaPips[colorObj[color]] / deck.totalManaPips.total) * 100
                                        return <>
                                            
                                            { width > 0 ? <div style={{
                                            width: `${width}%`,
                                            height: "20px",
                                            paddingLeft: "0px",
                                            marginLeft: "0px",
                                            borderRadius: "5px",
                                            backgroundColor: chipColors[color]
                                            }}>

                                            </div> : null}
                                        </> 
                                    })}
                                </div>
                                <Typography>
                                    {deck.deckName}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
            }) : <CircularProgress />}
       </Grid>
    </div>
    </> 
}

export default MyDecks
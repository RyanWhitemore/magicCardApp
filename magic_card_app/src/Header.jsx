import { Link, useNavigate } from "react-router-dom"
import styles from "./header.module.css"
import axios from "axios"
import { useRef, useState } from "react"
import Popup from "reactjs-popup"
import { useTheme } from "@emotion/react"
import Toolbar from "@mui/material/Toolbar"
import AppBar from "@mui/material/AppBar"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import { useOutsideAlerter } from "./util"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputBase from "@mui/material/InputBase"
import SearchIcon from "@mui/icons-material/Search"
import Paper from "@mui/material/Paper"
import { Autocomplete, Divider, TextField, useMediaQuery } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { sortResults } from "./util"
import { paginateCards } from "./util"

const Header = ({
        fromHome, 
        loginClicked, 
        setLoginClicked,
        setDefaultCards,
        setCards,
        collectionTotalPrice,
        setIsSearched,
        fromMyCards,
        setSortValue,
        sortValue, 
        username,
        password,
        setUsername,
        setPassword,
        login,
        fromDeckBuilder,
        fromMyDecks,
        fromLandingPage,
        fromAddCards,
        searchedCards,
        setSearchedCards,
        cards,
    }) => {

    const user = localStorage.getItem("userID")

    const [ suggestions, setSuggestions ] = useState([])

    const [ search, setSearch ] = useState("")

    const [ phoneDrawer, setPhoneDrawer] = useState(false)

    const changePassword = (e) => {
        e.preventDefault()

        setPassword(e.target.value)
    }

    const changeUsername = (e) => {
        e.preventDefault()

        setUsername(e.target.value)
    }

    const navigate = useNavigate()

    const theme = useTheme()

    const [ drawer, setDrawer ] = useState(false)

    const loginRef = useRef(null)

    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"))
    const isMediumScreen = useMediaQuery(theme.breakpoints.between("md", "lg"))

    useOutsideAlerter(loginRef, setLoginClicked)

    const searchByName = async (e) => {
        try {
            if (!fromAddCards) {
                setDefaultCards(null)
            }
            const results = await axios.get(`https://api.scryfall.com/cards/search?q=${search}${fromAddCards ? "&unique=prints" : ""}` )
            const collectionResults = await axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/getcards/` + user)
            for (const result of results.data.data) {
                for (let i = 0; i < collectionResults.data.length; i++) {
                    if (collectionResults.data[i].id === result.id) {
                        result.inCollection = true
                    }
                }
            }
            if (fromAddCards) {
                setSearchedCards(results.data.data)
            } else {
                setIsSearched(true)
                setCards(results.data.data)
            }
        } catch (err) {
            return <>
                <form onSubmit={(e) => {e.preventDefault(); searchByName(e)}}>
                    <input type="text" placeholder="Search" value={search}
                    onChange={handleChange}/>
                    <button>Search</button>
                </form>
            </>
        }
    }

    const searchMyCards = async (e) => {
        try {
            const results = await axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/myCards/` + user + "/" + search)
            setCards({data: [results.data]})
            setIsSearched(true)
        } catch (err) {
            console.log(err)
            return <>
                <form onSubmit={(e) => {e.preventDefault(); searchMyCards(e)}}>
                    <input type="text" placeholder="Search" value={search}
                    onChange={handleChange}/>
                    <button>Search</button>
                </form>
            </> 
        }
    }

    const handleChange = async (e) => {
        e.preventDefault()

        setSearch(e.target.value)

        const results = await axios.get("https://api.scryfall.com/cards/autocomplete?q=" + e.target.value)

        setSuggestions(results.data.data)
    }


    const logout = () => {
        localStorage.setItem("userID", "guest")
        localStorage.setItem("chosenColors", "all")
        localStorage.setItem("commander", JSON.stringify(false))
        localStorage.setItem("deck", JSON.stringify([]))
        localStorage.setItem("notChosenColors", JSON.stringify({data: ['G', "R", "B", "U", "W"]}))
        localStorage.setItem("deckCost", JSON.stringify(0.00))
        localStorage.setItem('deckID', null)
        window.location.reload()
    }

    const sort = (e) => {
        setSortValue(e.target.value)
        let newArray = cards.flat()

        newArray = sortResults(newArray, e.target.value)
        newArray = paginateCards(newArray)

        setCards(newArray)
    }

    const menuList = [
        "Home", "My Cards", "My Decks", "Add To Collection"
    ]

    const handleSearch = (e) => {
        if (fromAddCards | fromHome) {
            searchByName(e)
            setSearch("")
        } else if (fromMyCards) {
            searchMyCards(e)
            setSearch("")
        }
    }


    return <div>
        <AppBar  position="fixed" align="center" style={{
            paddingTop: "10px",
            boxShadow: "inset 0 0 0 10px rgb(37, 45, 63)",
            }}
            >
            <Toolbar>
                <Box sx={{
                    marginBottom: "10px"
                }} display="flex" alignItems="center">
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{borderRadius: 2, marginRight: "10px"}}
                        onClick={() => setDrawer(true)}
                    >
                        Menu
                    </IconButton>
                </Box>
                <Drawer
                    anchor={"left"}
                    open={drawer}
                    onClose={() => setDrawer(false)}
                >
                    <List>
                        {menuList.map((text) => {
                            return (
                                <ListItem key={text} disablePadding>
                                    <ListItemButton key={text + "button"} onClick={() => {
                                        if (text === "Home") {
                                            navigate("/")
                                        }
                                        if (text === "Add To Collection") {
                                            navigate("/addcards")
                                        }
                                        if (text === "My Cards") {
                                            navigate("/mycards")
                                        }
                                        if (text === "My Decks") {
                                            navigate("/mydecks")
                                        }
                                    }} >
                                        <ListItemText primary={text}/>
                                    </ListItemButton>
                                </ListItem>
                            )
                        })}
                    </List>
                </Drawer>
                    <Popup 
                        open={loginClicked} 
                        modal
                        nested    
                    >   
                        {close => (
                            <div className="modal" ref={loginRef}>
                                <div className={"header"}>Login</div>
                                <button className={"close"} onClick={() => {close(); setLoginClicked(!loginClicked)}}>
                                    &times;
                                </button>
                                <div className={"content"}>
                                    <form onSubmit={login}>
                                        <div className={"username"}>
                                            <input 
                                                type="text" 
                                                onChange={changeUsername} 
                                                placeholder="username">
                                            </input>
                                        </div>
                                        <div className={"password"}>
                                            <input 
                                                type="text" 
                                                onChange={changePassword} 
                                                placeholder="password">
                                            </input>
                                        </div>
                                        <button className={"loginbutton"} type="submit">Login</button>
                                    </form>
                                </div>

                            </div>    
                        )}

                    </Popup>
                    {!fromLandingPage ? <Autocomplete
                        id="search-bar"
                        freeSolo
                        clearOnEscape
                        options={suggestions}
                        onInputChange={handleChange}
                        onChange={handleSearch}
                        sx={{
                            marginBottom: "10px",
                            width: "300px",
                        }}
                        renderInput={(params) => <>
                             <TextField {...params} label="Search"/>
                        </>}
                           
                    /> : null}
                    <Box sx={{ flexGrow: 1, }}/>
                    { !isSmallScreen ? <div style={{display: "flex", alignItems: "center"}}>
                            { (fromHome & fromDeckBuilder) | (fromMyCards) ? <FormControl size="small"
                                style={{
                                    marginRight: "20px",
                                    marginBottom: "10px"
                            }}
                            >
                                <InputLabel id="sort-input">Sort</InputLabel>
                                <Select
                                    labelId="sort-input"
                                    id="sort"
                                    value={sortValue} 
                                    label="Sort"
                                    onChange={sort}  
                                >
                                    <MenuItem value={"name"}>Name</MenuItem>
                                    <MenuItem value="color">Color</MenuItem>
                                    <MenuItem value="value">Value</MenuItem>
                                </Select>
                            </FormControl> : null}
                        
                    <Button 
                    sx={{
                        marginBottom: "10px",
                        marginRight: "10px"
                    }}
                    variant={"contained"} size={"small"}
                    onClick={() => {
                        if (localStorage.getItem("userID") === "guest") {
                            setLoginClicked(!loginClicked)
                        } else {
                            logout() 
                        }
                    }} 
                    >
                        {localStorage.getItem("userID") === "guest" ? "Login" : "Logout"}
                    </Button> 
                    
                        {localStorage.getItem("userID") === "guest" && <Button 
                            variant={"contained"}
                            size="small"
                            sx={{
                                marginBottom: "10px"
                            }}
                            onClick={() => {
                                navigate("/register")
                            }}
                        >
                            Register
                        </Button>}
                        </div> : <div>
                        <IconButton
                            size="large"
                            edge="end"
                            color="inherit"
                            aria-label="login-sort-menu"
                            sx={{
                                borderRadius: 2,
                                marginBottom: "10px"
                            }}
                            onClick={() => setPhoneDrawer(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Drawer 
                            anchor="right"
                            open={phoneDrawer}
                            onClose = {() => {
                                setPhoneDrawer(false)
                            }}
                            PaperProps={{
                                sx: {width: "100px"}
                            }}
                        >
                                <div style={{display: "flex", 
                                alignItems: "center",
                                justifyContent: 'center',
                                flexDirection: "column"}}>
                                <Button 
                                    variant={"contained"} size={"small"}
                                    style={{
                                        marginTop: isSmallScreen ? "10px" : null,
                                    }}
                                    onClick={() => {
                                        if (localStorage.getItem("userID") === "guest") {
                                            setPhoneDrawer(false)
                                            setLoginClicked(!loginClicked)
                                        } else {
                                            setPhoneDrawer(false)                                    
                                            logout() 
                                        }
                                    }} 
                                >
                                    {localStorage.getItem("userID") === "guest" ? "Login" : "Logout"}
                                </Button> 
                                {localStorage.getItem("userID") === "guest" && <div style={{
                                    marginTop : isSmallScreen ? "10px" : null
                                }}>
                                    <Button size="small"
                                        variant="contained"
                                        onClick={() => {
                                            navigate("/register")
                                        }}
                                    >Register</Button>
                                </div>}
                                {fromMyCards | fromHome ? <FormControl
                                    size="small" 
                                    style={{
                                        marginTop: "15px",
                                        width: "100px"
                                    }}
                                >
                                    <InputLabel id="sort-input">Sort</InputLabel>
                                    <Select
                                        labelId="sort-input"
                                        id="sort"
                                        value={sortValue} 
                                        label="Sort"
                                        onChange={sort}
                                        sx={{
                                            borderColor: theme.palette.primary.main,
                                        }}
                                    >
                                        <MenuItem value="name">Name</MenuItem>
                                        <MenuItem value="color">Color</MenuItem>
                                        <MenuItem value="value">Value</MenuItem>
                                    </Select>
                                </FormControl> : null}
                            </div>
                        </Drawer>
                    </div>}
            </Toolbar>
        </AppBar>
        <Toolbar />
        <Toolbar />
    </div>
}

export default Header
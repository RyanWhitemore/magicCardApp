import { useState } from "react"
import { sortResults, paginateCards } from "./util"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import TextField from "@mui/material/TextField"
import Checkbox from "@mui/material/Checkbox"
import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"

const Filter = ({
    data, cards, totalSetColInfo, setCards, sortValue,
    filter, setFilter, sets, filterClicked, setFilterClicked,
    filterSetParams, setFilterSetParams
}) => {

    const [ checked, setChecked ] = useState([])

    const [ colorsNotChecked, setColorsNotChecked ] = useState(["White", "Blue", "Black", "Red", "Green", "Colorless"])

    const [ typeChecked, setTypeChecked ] = useState([])
    
    const filterOptions = ["Set", "CMC", "Colors", "Type"]

    const colorFilterOptions = ["White", "Blue", "Black", "Red", "Green", "Colorless"]

    const colorObj = {"White": "W", "Blue": "U", "Black": "B", "Red": "R", "Green": "G", "Colorless": true}
    
    const types = [
        "Land", "Creature", "Artifact", "Enchantment", "Planeswalker", "Battle",
        "Instant", "Sorcery", "Legendary", "Conspiracy", "Tribal"
    ]

    const filterCards = (e, val, fromSetFilter = false) => {
        let newCards
        if (filterSetParams && !fromSetFilter) {
            newCards = totalSetColInfo.flat()
        } else {
            newCards = data.flat()
        }


        newCards = filterCmc(newCards, val)
        newCards = filterColors(newCards, val)
        newCards = filterTypes(newCards, val)
        
        newCards = sortResults(newCards, sortValue)
        newCards = paginateCards(newCards)

        setCards(newCards)
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

    const filterTypes = (newCards, val) => {
        let cardsToReturn = newCards.slice()
        const currentIndex = typeChecked.indexOf(val)

        let newTypes = typeChecked.slice()
        if (types.indexOf(val) >= 0) {
            if (currentIndex >= 0) {
                newTypes.splice(currentIndex, 1)
            } else {
                newTypes.push(val)
                
            }
            setTypeChecked(newTypes)
        }
        if (newTypes.length === 0) {
            return cardsToReturn
        }
       

        cardsToReturn = cardsToReturn.filter((card) => {
            for (const type of newTypes) {
                if (card.type_line.includes(type)) {
                    return true
                }
            }
            return false
        })

        return cardsToReturn

    }

    return <>
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
                                                <ListItemButton onClick={(e) => filterCards(e, num + 1)}>
                                                    <ListItemIcon>
                                                        <Checkbox 
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
                                            <ListItemButton onClick={(e) => filterCards(e, num + 9)}>
                                                <ListItemIcon>
                                                    <Checkbox 
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
                            </List> : <List>
                                {types.map((type) => {
                                    const labelId = `checkbox-type-label-${type}`
                                    return <ListItem>
                                        <ListItemButton onClick={(e) => {filterCards(e, type)}}>
                                            <ListItemIcon>
                                                <Checkbox 
                                                    edge="start"
                                                    checked={typeChecked.indexOf(type) >= 0}
                                                    tabIndex={-1}
                                                    disableRipple
                                                    inputProps={{"aria-labelledby": labelId}}
                                                />
                                            </ListItemIcon>
                                            <ListItemText id={labelId} primary={type} />
                                        </ListItemButton>
                                    </ListItem>
                                })}
                            </List>}
                        </AccordionDetails>
                </Accordion>
            })}
        </Drawer>
    </>

}

export default Filter
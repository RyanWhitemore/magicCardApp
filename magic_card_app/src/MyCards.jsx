import axios from "axios"
import Card from "./Card"
import Header from "./Header"
import "./MyCards.css"
import { useQuery } from "react-query"
import { useState } from "react"
import Popup from "reactjs-popup"


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

    const changePassword = (e) => {
        e.preventDefault()

        setPassword(e.target.value)
    }

    const changeUsername = (e) => {
        e.preventDefault()

        setUsername(e.target.value)
    }

    let { data, isFetching } = useQuery({queryKey: ["myCardData"], refetchOnWindowFocus: false, queryFn: () => {
        if (userID !== "guest") {
            return axios.get(`http://localhost:${process.env.REACT_APP_SERVPORT}/getCards/` + userID).then((res) => {
            setCards(res)
            return res
            })
        }
        
    }, enabled: userID !== "guest"})

    if (sortValue === "name") {
        if (data) {
            data = data.data.sort((a, b) => {
                return a.name.localeCompare(b.name)
            })
        }
    }

    if (sortValue === "value") {
        if (data) {
            data = data.data.sort((a, b) => {
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
        if (data) {
            data = data.data.sort((a, b) => {
                
                a = a.color_identity.join()
                b = b.color_identity.join()

                return b.localeCompare(a)

            })
        }
    }



    const getCollectionTotalPrice = () => {
        let totalCollectionPrice = 0.00
        if (!isFetching && userID !== "guest" && data) {
            for (const card of data) {
                if (card.prices.usd) {
                    totalCollectionPrice = 
                    (parseFloat(card.prices.usd) * parseFloat(card.quantity))+ 
                    parseFloat(totalCollectionPrice)
                    totalCollectionPrice = totalCollectionPrice.toFixed(2)
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
            loginClicked={loginClicked}
            setLoginClicked={setLoginClicked}
            setUsername={setUsername}
            setPassword={setPassword}
            login={login}
        />
        <div id="main">
            {userID !== "guest" && !isFetching && !isSearched ? 
                <div className="cards">{data.map((card) => {
                    return <Card 
                        key={card.id}
                        withoutButton={true} 
                        card={card}
                        withDeleteButton={true}
                        fromMyCards={true}
                        userID={userID}
                        search={search}
                        setSearch={setSearch}
                        cards={cards}/>
            })}</div> : null}
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
        </div>
    </>
}

export default MyCards
import { useEffect } from "react"

const useOutsideAlerter = (ref, setPopup) => {
    useEffect(() => {
        const handleOutsideClick = (e) => {
            // if the reference does not contain the target of the click
            if (ref.current && !ref.current.contains(e.target)) {
                setPopup(false)
            }
        }

        document.addEventListener("mousedown", handleOutsideClick)

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick)
        }
    }, [ref, setPopup]) 
}


const paginateCards = (cardArray) => {
        const pageCount = Math.ceil(cardArray.length / 75)

        const paginatedPages = []

        for (let i=0; i < pageCount; i++) {
            const start = i * 75
            const end = start + 75
            paginatedPages.push(cardArray.slice(start, end))
        }
    return paginatedPages 
}

const sortResults = (results, sortValue) => {
    if (sortValue === "name") {
        if (results) {
            results = results.sort((a, b) => {
                return a.name.localeCompare(b.name)
            })
        }
    }

    if (sortValue === "value") {
        if (results) {
            results = results.sort((a, b) => {
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
            results = results.sort((a, b) => {

                a = a.color_identity.join()
                b = b.color_identity.join()
            
                return b.localeCompare(a)
            
            })
        }
    }
    return results
}


export {useOutsideAlerter, paginateCards, sortResults}
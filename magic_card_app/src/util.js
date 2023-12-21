import { useEffect, useRef } from "react"

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


export {useOutsideAlerter, paginateCards}
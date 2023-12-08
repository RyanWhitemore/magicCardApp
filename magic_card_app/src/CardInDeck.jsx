import styles from "./CardInDeck.module.css"


const CardInDeck = ({card}) => {

    return <>
        <div className={styles.cardContainer}>
            <p>{card.name} {card.type_line} {card.mana_cost}</p>
        </div>
    </>

}

export default CardInDeck
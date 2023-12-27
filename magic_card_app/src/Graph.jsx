import styles from "./Graph.module.css"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Label } from "recharts"




const Graph = () => {

const deck = JSON.parse(localStorage.getItem("deck"))

let maxCmc = 0

const axisValues = {}
const barData = []
const manaObj = {W: 0, U: 0, B: 0, R: 0, G: 0}
const manaNamesObj = {
    W: "White", U: "Blue", B: "Black", M:"Multicolored",
    R: "Red", G: "Green", C: "Colorless"
}
const manaArray = []
const obj = {}

for (const card of deck) {
    if (card.card.cmc > maxCmc) {
        maxCmc = card.card.cmc
    }
    for (let i = 0; i < maxCmc + 1; i++) {
        if (card.card.type_line.includes("Land")) {

        } else if (card.card.cmc === i) {
            if (!obj[i]) {
                obj[i] = {cmc: i, amt: 1, W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, M: 0}
                if (card.card.color_identity.length === 0) {
                    obj[i].C += 1
            }
            if (card.card.color_identity.length > 1) {
                    obj[i].M += 1
                }
            if (card.card.color_identity.length === 1) {
                    obj[i][card.card.color_identity[0]] += 1
                }
            } else {
                obj[i].amt += 1
                if (card.card.color_identity.length === 0) {
                        obj[i].C += 1
                }
                if (card.card.color_identity.length > 1) {
                        obj[i].M += 1
                    }
                if (card.card.color_identity.length === 1) {
                        obj[i][card.card.color_identity[0]] += 1
                    }
                }
                }
            }
                
                for (const color of card.card.mana_cost) {
                    if (color === "{" | color === "}") {
                    } else if ( parseInt(color) >= 0) {
                    } else {
                        manaObj[color] += 1
                    }
        }
    }
 
 for (const key of Object.keys(manaObj)) {
    const tempObj = {}
    tempObj.amt = manaObj[key]
    tempObj.color = key
    manaArray.push(tempObj)
}
 
for (const key of Object.keys(obj)) {
    barData.push(obj[key])
}
for (let i=0; i<maxCmc+1; i++) {
    axisValues[i] = 0
}

let numManaTicks = 0

for (const entry of manaArray) {
    const prevAmount = numManaTicks
    if (entry.amt > prevAmount) {
        numManaTicks = entry.amt
    }
    if (numManaTicks > 5) {
        numManaTicks = 5
    }
}

let numCmcTicks = 0

for (const entry of barData) {
    const prevAmount = numCmcTicks
    if (entry.amt > prevAmount) {
        numCmcTicks = entry.amt
    }
    if (numCmcTicks > 4) {
        numCmcTicks = 4
    }
}

const renderCustomPipTick = ({x, y, payload}) => {
    let path = ''
    let colorless = false

    switch (payload.value) {
        case "W":
            path = "/whitePip.png"
            break;
        case "U":
            path = '/bluePip.png'
            break;
        case "B":
            path = '/blackPip.png'
            break;
        case "R":
            path = '/redPip.png'
            break;
        case "G":
            path = '/greenPip.png'
            break;
        case "C":
            colorless = true
            break;
        default:
            path="" 
    }

    if (colorless) {
        return null
    }

    return <svg>
        <image href={path} height={15} width={15} x={x - 7} y={y + 2} textAnchor="middle"/>
    </svg>
}


const CustomToolTip = ({active, payload, label}) => {
    if (active) {

        const tooltipContent = payload.map((entry, index) => {
            if (entry.value > 0) {
                return (
                    <div>
                        <p key={`item-${index}`} style={{color: "white"}}>
                            {`${manaNamesObj[entry.name]} Cards: ${entry.value}`}
                        </p>
                    </div>
                )
            }  else {
                return null
            }
        })
        if (payload.length > 0) {
            return <div className={styles.customToolTip}>
            <p className={styles.label}>{`CMC: ${label}`}</p>
            <p className={styles.total}>{`Total Cards: ${payload[0].payload.amt}`}</p>
            {tooltipContent}
            </div>
        } else {
            return null
        }
        
    }
}


return <div className={styles.graphs}>
    <div className={styles.graph}>
    <div style={{flex: 1}}>{/*empty div to push content down*/}</div>
        <BarChart margin={{top: 10, right: 10, left: 10, bottom: 10}} overFlow="visable" width={250} height={200} data={manaArray}>
            <Bar dataKey="amt" fill="white"/>
            <XAxis height={40} stroke="white" dataKey="color" tick={renderCustomPipTick}>
                <Label value="Mana Pips" offset={-10} position="bottom" stroke="white"/>
            </XAxis>
            <YAxis  tickCount={numManaTicks} stroke="white">
                <Label value="Number of Pips" angle={-90} stroke="white"/>    
            </YAxis> 
        </BarChart>
    </div>
    <div className={styles.graph}>
        <BarChart width={250} height={200} data={barData}>
            <XAxis stroke="white" dataKey="cmc">
                <Label value="CMC" position="bottom" offset={-7} stroke="white"/>
            </XAxis>
            <YAxis stroke="white" tickCount={numCmcTicks +1 }>
                <Label value="Number of Cards" stroke="white" angle={-90}/>
            </YAxis>
            <Tooltip content={CustomToolTip} />
            <Bar dataKey="W" stackId="a" fill="rgb(220, 213, 197)"/>
            <Bar dataKey="U" stackId="a" fill="rgb(64, 91, 182)"/>
            <Bar dataKey="B" stackId="a" fill="rgb(20, 19, 27"/>
            <Bar dataKey="R" stackId="a" fill="rgb(176, 50, 35)"/>
            <Bar dataKey="G" stackId="a" fill="rgb(68, 94, 67)"/>
            <Bar dataKey="C" stackId="a" fill="darkgray"/>
            <Bar dataKey="M" stackId="a" fill="rgb(187, 162, 80)"/>
        </BarChart>
    </div>
</div>

}

export default Graph
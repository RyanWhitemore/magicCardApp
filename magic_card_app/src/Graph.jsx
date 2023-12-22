import { useMemo, useState } from "react"
import styles from "./Graph.module.css"
import Chart from 'react-apexcharts'

const Graph = () => {

const deck = JSON.parse(localStorage.getItem("deck"))

let maxCmc = 0

const axisValues = {}



for (const card of deck) {
    if (card.card.cmc > maxCmc) {
        maxCmc = card.card.cmc
    }
}

for (let i=0; i<maxCmc+1; i++) {
    axisValues[i] = 0
}

for (const card of deck) {
    for (let i=0; i<maxCmc+1; i++) {
        if (card.card.cmc === i) {
            axisValues[i] += 1
        }
    }
}

const xaxis = {categories: []}
const data = []

for (const key of Object.keys(axisValues)) {
    data.push(axisValues[key])
    xaxis.categories.push(key)
}


const series = [{name: "Cmc", data}]
 
const options = {
    chart: {
        id: "bar"
    },
    xaxis,
    bar: {
        dataLabels: {
            total: {
                style: {
                    color: "#46498f",
                    fontSize: "20px"
                }
            }
        }
    }
}

return <Chart
            options={options}
            series={series}
            type="bar"
            width="250"
            />


}

export default Graph
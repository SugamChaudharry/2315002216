import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Log } from 'logging_middleware'
dotenv.config({ path: '../.env' })

const app = express()
app.use(cors())
app.use(express.json())

const TEST_SERVER = process.env.TEST_SERVER || 'http://4.224.186.213/evaluation-service'
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''

interface Vehicle {
  TaskID: string
  Duration: number   // hours (weight)
  Impact: number     // score (value)
}

interface Depot {
  ID: number
  MechanicHours: number  // capacity
}

// 0/1 Knapsack — O(n * capacity)
function knapsack(vehicles: Vehicle[], capacity: number): {
  selected: Vehicle[]
  totalImpact: number
  totalHours: number
} {
  const n = vehicles.length
  
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0))

  for (let i = 1; i <= n; i++) {
    const vehicle = vehicles[i - 1]
    if (!vehicle) continue
    const { Duration, Impact } = vehicle
    
    const currentForm = dp[i]
    const prevForm = dp[i - 1]
    if (!currentForm || !prevForm) continue

    for (let w = 0; w <= capacity; w++) {
      currentForm[w] = prevForm[w] ?? 0
      if (Duration <= w) {
        const potentialValue = (prevForm[w - Duration] ?? 0) + Impact
        currentForm[w] = Math.max(currentForm[w] ?? 0, potentialValue)
      }
    }
  }

  // Backtrack to find selected vehicles
  const selected: Vehicle[] = []
  let w = capacity
  for (let i = n; i > 0; i--) {
    const vehicle = vehicles[i - 1]
    if (!vehicle) continue
    
    const currentForm = dp[i]
    const prevForm = dp[i - 1]
    if (!currentForm || !prevForm) continue

    if (currentForm[w] !== prevForm[w]) {
      selected.push(vehicle)
      w -= vehicle.Duration
    }
  }

  const finalRow = dp[n]
  const totalImpact = finalRow ? (finalRow[capacity] ?? 0) : 0

  return {
    selected,
    totalImpact,
    totalHours: selected.reduce((sum, v) => sum + v.Duration, 0)
  }
}

// GET /schedule — fetch depots + vehicles, run knapsack per depot
app.get('/schedule', async (req, res) => {
  try {
    Log('backend', 'info', 'handler', 'GET /schedule called')

    const [depotRes, vehicleRes] = await Promise.all([
      fetch(`${TEST_SERVER}/depots`, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }),
      fetch(`${TEST_SERVER}/vehicles`, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } })
    ])

    const depotData = await depotRes.json() as { depots: Depot[] }
    const { depots } = depotData
    const vehicleData = await vehicleRes.json() as { vehicles: Vehicle[] }
    const { vehicles } = vehicleData

    Log('backend', 'info', 'service', `Fetched ${depots.length} depots, ${vehicles.length} vehicles`)

    const results = depots.map(depot => {
      const result = knapsack(vehicles, depot.MechanicHours)
      return {
        depotID: depot.ID,
        mechanicHoursBudget: depot.MechanicHours,
        ...result
      }
    })

    res.json({ results })
  } catch (err) {
    Log('backend', 'fatal', 'handler', `GET /schedule failed: ${err}`)
    res.status(500).json({ error: String(err) })
  }
})

app.listen(4000, () => {
  Log('backend', 'info', 'service', 'Vehicle scheduler running on port 4000')
  console.log('Vehicle scheduler on http://localhost:4000')
})
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const mysql = require('mysql')
require('dotenv').config()
const cors = require('cors')

const app = express()
const port = process.env.PORT

// Configure body parser to parse JSON request bodies
app.use(bodyParser.json())
app.use(cors())

// Create a MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
})

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

app.get('/', (req, res) => {
    res.send('Hello World! this is me')
})

con.connect(function (err) {
    if (err) throw err
    console.log('Connected!')
})

// Endpoint to search for a city by query
app.get('/api/search', async (req, res) => {
    try {
        const { query } = req.query
        const response = await axios.get(
            `http://dataservice.accuweather.com/locations/v1/cities/autocomplete`,
            {
                params: {
                    apikey: process.env.ACCUWEATHER_API_KEY,
                    q: query,
                },
            },
        )
        res.send(response.data)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

// Endpoint to get the current weather for a city
app.get('/api/currentWeather', async (req, res) => {
    try {
        const { cityKey } = req.query
        const response = await axios.get(
            `http://dataservice.accuweather.com/currentconditions/v1/${cityKey}`,
            {
                params: {
                    apikey: process.env.ACCUWEATHER_API_KEY,
                    details: true,
                },
            },
        )
        const { Temperature, WeatherText } = response.data[0]
        const celsiusTemperature = Temperature.Metric.Value
        res.send({
            city_key: cityKey,
            temperature: celsiusTemperature,
            weather_text: WeatherText,
            data: response.data[0],
        })
        res.send(response.data[0])
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

// Endpoint to get all favorites
app.get('/api/favorites', (req, res) => {
    const query = 'SELECT * FROM favorites'
    pool.query(query, (err, results) => {
        if (err) throw err
        res.json(results)
    })
})

// Endpoint to add a favorite city
app.post('/api/favorites', async (req, res) => {
    try {
        const { userId, cityKey, cityName, temperature } = req.body
        await query(
            `INSERT INTO favorites (user_id, city_key, city_name, temperature) VALUES (?, ?, ?, ?);`,
            [userId, cityKey, cityName, temperature],
        )
        res.sendStatus(201)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

// Endpoint to delete a favorite city for a user
app.delete('/api/favorites/:id', async (req, res) => {
    try {
        const { id } = req.params
        await query(`DELETE FROM favorites WHERE id = ?`, [id])
        res.sendStatus(204)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

// Helper function to execute a MySQL query with the connection pool
function query(sql, args) {
    return new Promise((resolve, reject) => {
        pool.query(sql, args, (err, result) => {
            if (err) {
                return reject(err)
            }
            resolve(result)
        })
    })
}

app.listen(port, () => console.log(`Listening on port ${port}`))

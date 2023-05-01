const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql');
require('dotenv').config()

const app = express();
const port = process.env.PORT;

// Configure body parser to parse JSON request bodies
app.use(bodyParser.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'weather_db'
});

app.get('/', (req, res) => {
    res.send('Hello World! this is me')
});


// Endpoint to search for a city by query
app.get('/api/search', async (req, res) => {
    try {
        const { query } = req.query;
        const response = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/autocomplete`, {
            params: {
                apikey: process.env.ACCUWEATHER_API_KEY,
                q: query
            }
        });
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Endpoint to get the current weather for a city
app.get('/api/currentWeather', async (req, res) => {
    try {
        const { cityKey } = req.query;
        const [result] = await query(`SELECT * FROM weather WHERE city_key = ?`, [cityKey]);
        if (result) {
            res.send(result);
        } else {
            const response = await axios.get(`http://dataservice.accuweather.com/currentconditions/v1/${cityKey}`, {
                params: {
                    apikey: process.env.ACCUWEATHER_API_KEY,
                    details: true
                }
            });
            const { Temperature, WeatherText } = response.data[0];
            const celsiusTemperature = Temperature.Metric.Value;
            await query(`INSERT INTO weather (city_key, temperature, weather_text) VALUES (?, ?, ?)`, [cityKey, celsiusTemperature, WeatherText]);
            res.send({ city_key: cityKey, temperature: celsiusTemperature, weather_text: WeatherText });
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Endpoint to add a favorite city for a user
app.post('/api/favorites', async (req, res) => {
    try {
        const { userId, cityKey, cityName } = req.body;
        await query(`INSERT INTO favorites (user_id, city_key, city_name) VALUES (?, ?, ?)`, [userId, cityKey, cityName]);
        res.sendStatus(201);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Endpoint to delete a favorite city for a user
app.delete('/api/favorites/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query(`DELETE FROM favorites WHERE id = ?`, [id]);
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Helper function to execute a MySQL query with the connection pool
function query(sql, args) {
    return new Promise((resolve, reject) => {
        pool.query(sql, args, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

app.listen(port, () => console.log(`Listening on port ${port}`));

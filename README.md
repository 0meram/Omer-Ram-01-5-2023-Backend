
# Weather App
# A simple weather app that allows you to search for a city and get the current weather and a 5-day forecast.

To run the application locally, you will need the following:

Node.js
MySQL

# Installing
Clone the repository: git clone https://github.com/your-username/weather-app.git
Install dependencies: npm install

Setup

# Create a .env file at the root of the project.
Add the following environment variables to the .env file:


NODE_ENV=development
PORT=5000
DB_HOST='localhost'
DB_USER='root'
DB_PASSWORD='********'
DB_DATABASE='weatherapp'
ACCUWEATHER_API_KEY='8MDEk6W4RtU9IsBOzuWGECgN1c5aH7Fe'


# Create a MySQL database and table:

CREATE DATABASE weatherapp;
USE weatherapp;

-- CREATE TABLE favorites (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   user_id BIGINT NOT NULL,
--   city_key VARCHAR(100) NOT NULL,
--   city_name VARCHAR(100) NOT NULL,
--   temperature DECIMAL(5, 2) NOT NULL DEFAULT 0,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   UNIQUE KEY (user_id, city_key)
-- );

# Start the server: npm start
Open a web browser and navigate to http://localhost:3000.

Built With:

Node.js
Express
MySQL
Axios
React

Author
Omer Ram
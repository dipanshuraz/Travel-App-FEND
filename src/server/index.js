// Setup empty JS object to act as endpoint for all routes
let projectData = {};

// Require Express to run server and routes
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const axios = require('axios');

const GeoNames = 'api.geonames.org/postalCodeSearchJSON?';
const darkSky = 'api.darksky.net/forecast';
const pixabayAPI = 'pixabay.com/api';

dotenv.config({ path: './.env' })

// http://api.geonames.org/postalCodeLookupJSON?postalcode=6600&country=AT&username=demo

// Start up an instance of app
const app = express();

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

// Initialize the main project folder
app.use(express.static('dist'));


// Setup Server
const port = 8080;



app.listen(port, () => console.log(`Server running! Running on localhost: ${port}!`));

let _fetchGeoNames = async (username, zipOrCity = '11230') => {
  // we build our data necessary for doing the fetch operation from weather api
  const cityOrPostal = getCityOrPostalCode(zipOrCity);
  const url = `http://${GeoNames}${cityOrPostal}&maxRows=10&username=${username}`;
  return axios.get(url).then(response => {
    return response.data.postalCodes[0];
  });
};

let getCityOrPostalCode = zipOrCity => {
  if (/\d/.test(zipOrCity.value)) {
    return 'postalcode=' + zipOrCity;
  } else {
    // Otherwise we simply expect it to be a city, and as above, do validation here if you want to
    return 'placename=' + zipOrCity;
  }
};

// function to send lat/long to dark sky
let _fetchDarkSky = async (darkSkyKey, lat, long) => {
  const url = `https://${darkSky}/${darkSkyKey}/${lat},${long}`;
  return axios.get(url).then(response => {
    return response.data.daily.data[0];
  });
};

let _fetchPixaby = async (pixabaykey, image) => {
  // data necessary for doing the fetch operation from pixabay api
  const url = `https://${pixabayAPI}/?key=${pixabaykey}&q=${image}`;
  return await axios.get(url).then(response => {
    if (response.data.totalHits != 0) {
      return response.data.hits[0].largeImageURL;
    } else {
      return { error: 'no results' };
    }
  });
};

app.get("/test", (req, res) => {
  res.status(200).send("Hello World!");
});


app.get('/geonames', (req, res) => {
  const { zip } = req.query;

  _fetchGeoNames(process.env.username, zip).then(response => {
    res.end(JSON.stringify(response));
  });
});


app.get('/darksky', (req, res) => {
  const {
    lat,
    long
  } = req.query;

  _fetchDarkSky(process.env.key, lat, long).then(response => {
    res.end(JSON.stringify(response));
  }).catch(error => console.log(error));
});


app.get('/pixabay', (req, res) => {
  const {
    picture
  } = req.query.image;

  _fetchPixaby(process.env.pixabaykey, picture).then(response => {
    res.end(JSON.stringify(response));
  });
});

module.exports = app
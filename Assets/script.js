
// this is how we are going to interact with the API 

var searchHistory = [];
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = '65f52f669b7ae14b669109a38508fa50';

//////////////////////////////////////////////////////

// this will get the container that holds the users search
var searchForm = document.getElementById('search-form');

// this will get the contanier that gets the users input
var searchInput = document.getElementById('search-input');

// this will get the section that holds today's forecast and the future 4 day forecast on the right side of the page
var todayContainer = document.getElementById('today');
var forecastContainer = document.getElementById('forecast');

// this will get the container to hold the history of the past searches 
var searchHistoryContainer = document.getElementById('history');

//////////////////////////////////////////////////////

// these will add functionality to dayjs 
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

//////////////////////////////////////////////////////

// 1st let's create a function that will enable the search button to work 

function submitForm(event) {
  
  // we need to stop the function in case no input is provided
  if (!searchInput.value) {
    return;
  }

  // will stop the page from reloading 
  event.preventDefault();

  // will take the users input value and trim excess spaces
  var search = searchInput.value.trim();

  // this will take our stored user input and use it as the parameter for our fetch coordinates function above --> our 2nd step
  fetchCoordinates(search);

  // this will clear our input value
  searchInput.value = '';
}

//////////////////////////////////////////////////////

// 2nd let's create a function that takes the user search value and makes a call to the API

function fetchCoordinates(search) {

  // using a query shortcut to grab a variable inside a template literal and using an URI
  // here we are calling our global variables
  // the search variable we created above that stored our location and convert it to coordinates
  var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;

  fetch(apiUrl)

    // this will send a request to the API
    .then(function (response) {

      // this function will grab the respone and turn it into a javascript object
      return response.json();
    })

    // this will pass our new retrieved data as a parameter to the function 
    .then(function (data) {

      // if the data is not zero indexed produce an alert that will notify user location is not found
      if (!data[0]) {
        alert('Location not found');
      } 
        // this will add it to our history or previously look up cities in our div and produce our 3rd step and 4th step
        // 3rd step is to pass the data into a new function 
        // 4th step is to update the local storage
        else {
        appendToHistory(search);
        fetchWeather(data[0]);
      }
    })

    // this will display an error in console if there is one
    .catch(function (error) {
      console.error(error);
    });
}

//////////////////////////////////////////////////////

// our 3rd step is to deal with the data from the api

// using the location as the parameter that we stored above as the data that was zero indexed
function fetchWeather(location) {

  // using the geolocation from the fetchcoordinates function will store the longitude and latitude as a location
  var { lat } = location;
  var { lon } = location;

  // stores the location name as a city variable
  var city = location.name;

  // this will grab the weather based on the longtidue and latitdue and store it is a variable
  var apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;

  // this sends a call to the api
  fetch(apiUrl)

    // this takes the call response and store it as a javascript object
    .then(function (response) {
      return response.json();
    })

    // this will take the data and pass it through a new function that displays our city and data about it
    // this will be done after our 4th step
    .then(function (data) {
      renderItems(city, data);
    })

    // this will display an error message in the console
    .catch(function (err) {
      console.error(err);
    });
}

//////////////////////////////////////////////////////

// this is our 4th step to place our search into the local storage
function appendToHistory(search) {

  // if the search history array we created above does not have an index of search that doesn't equal -1 stop the function
  if (searchHistory.indexOf(search) !== -1) {
    return;
  }

  // this will push the searched location into the array 
  searchHistory.push(search);

  // this will set the data items in local storage
  // the search history will be the key and the stringify will turn our search history into a string
  localStorage.setItem('search-history', JSON.stringify(searchHistory));

  // now we run the next function aka our 6th step
  renderSearchHistory();
}

//////////////////////////////////////////////////////

// our 5th step is to place our location data on the screen when we run the functions within this function

function renderItems(city, data) {

  // this will take our city and data parameters and pass them through this function - our 7th step
  renderCurrentWeather(city, data.list[0], data.city.timezone);

  // this will take our data.list into our next function - our 8th step 
  renderForecast(data.list);
}

//////////////////////////////////////////////////////

// our 6th step is now to display our past search history

function renderSearchHistory() {

  // this will grab our elements text and set it to blank
  searchHistoryContainer.innerHTML = '';

  // this will take one less than our search history array's length and end at zero and get there by stepping down by one 
  for (var i = searchHistory.length - 1; i >= 0; i--) {

    // here we create our element to add the the container to hold our information
    var btn = document.createElement('button');

    // this will give our button attributes 
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-controls', 'today forecast');

    // this is going to add classes to our button
    btn.classList.add('history-btn', 'btn-history');

    // this sets an attribute data search and gives it a value 
    btn.setAttribute('data-search', searchHistory[i]);

    // sets the content of the button to the search history array that is indexed
    btn.textContent = searchHistory[i];

    // this appends our button 
    searchHistoryContainer.append(btn);
  }
}

//////////////////////////////////////////////////////


// now our 7th step is to display the current weather

// this function takes in 2 parameters city and weather
function renderCurrentWeather(city, weather) {

  // lets create variables 
  var date = dayjs().format('M/D/YYYY');

  // this will take our data from the fetch we made earlier and store it as variables
  var tempF = weather.main.temp;
  var windMph = weather.wind.speed;
  var humidity = weather.main.humidity;
  var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  var iconDescription = weather.weather[0].description || weather[0].main;

  // this will initiate variables that create elements
  var card = document.createElement('div');
  var cardBody = document.createElement('div');
  var heading = document.createElement('h2');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  // this will now set attributes to our new elements
  card.setAttribute('class', 'card');
  cardBody.setAttribute('class', 'card-body');

  // append cardy body to card
  card.append(cardBody);

  // this will now set attributes to our new elements
  heading.setAttribute('class', 'h3 card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');

  // this will add text content to our heading using the jquery shortcut 
  heading.textContent = `${city} (${date})`;

  // add some atttributes to our new elements
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');

  // put the weathericon under the heading
  heading.append(weatherIcon);

  // amend some text content 
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  // set our new variables under the cardbody
  cardBody.append(heading, tempEl, windEl, humidityEl);

  todayContainer.innerHTML = '';
  todayContainer.append(card);
}

//////////////////////////////////////////////////////

// this is our 8th step that will display the 5 day forecast

function renderForecast(dailyForecast) {

  // this will create variables for start and end date with proper formatting
  var startDt = dayjs().add(1, 'day').startOf('day').unix();
  var endDt = dayjs().add(6, 'day').startOf('day').unix();

  // this will create elements to store our forecasts
  var headingCol = document.createElement('div');
  var heading = document.createElement('h4');

  // give our new variable attributes we want, a class for formatting
  headingCol.setAttribute('class', 'col-12');

  // add text to our new element
  heading.textContent = '5-Day Forecast:';

  // put the heading under neath the heading column
  headingCol.append(heading);

  // change the innerhtml of our variable that grabs a specific element
  forecastContainer.innerHTML = '';

  // this puts our new heading column under the forecastcontainer element
  forecastContainer.append(headingCol);

  // now we will run a for loop that starts at zero and ends at the parameters length and will get there by stepping up one
  for (var i = 0; i < dailyForecast.length; i++) {

    // next we run a conditional, if the daily forecast is greater than the start date and less than the end date 
    if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {

      // a conditional within a conditional that wil tell us the time at noon
      if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {

        // then we can run our next function ---> this is our 9th step
        renderForecastCard(dailyForecast[i]);
      }
    }
  }
}

//////////////////////////////////////////////////////

// our 9th step is to create a function that holds our previous function data

function renderForecastCard(forecast) {

  // this will create variables using the data from the weather api
  var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var iconDescription = forecast.weather[0].description;
  var tempF = forecast.main.temp;
  var humidity = forecast.main.humidity;
  var windMph = forecast.wind.speed;

  // now we need to create elements that will house our variables above
  var col = document.createElement('div');
  var card = document.createElement('div');
  var cardBody = document.createElement('div');
  var cardTitle = document.createElement('h5');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  // this will create our styling on the page by appending the card to the column then the cardbody to the card and then the information in the cardbody
  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  // now we set attributes to the elements we created
  col.setAttribute('class', 'col-md');
  col.classList.add('five-day-card');
  card.setAttribute('class', 'card bg-primary h-100 text-white');
  cardBody.setAttribute('class', 'card-body p-2');
  cardTitle.setAttribute('class', 'card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');

  // lastly we need to add text content to our card title with formatting
  cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');

  // lets add some attributes our icon 
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);

  // this will add text content using objects from the data
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  // lastly we add our col element to the global variable
  forecastContainer.append(col);
}

//////////////////////////////////////////////////////

// step 1 = we initialized the submit button for our location of choice
// step 2 = was a fetch request to get the location data
// step 3 = was a fetch request to get the locations weather data
// step 4 = was to append our search to local history
// step 5 = was a function that called step 6 and step 7
// step 6 = was to render a past search list
// step 7 = was to display the current weather using api data
// step 8 = was to display the forecast using api data
// step 9 = was to render a place to put the forecast

// okay so here we are in our last couple steps

// add functionality to our past searches

//////////////////////////////////////////////////////

// Function to get search history from local storage
function initSearchHistory() {
  var storedHistory = localStorage.getItem('search-history');
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
  }
  renderSearchHistory();
}


//////////////////////////////////////////////////////

function handleSearchHistoryClick(e) {
  // Don't do search if current elements is not a search history button
  if (!e.target.matches('.btn-history')) {
    return;
  }

  var btn = e.target;
  var search = btn.getAttribute('data-search');
  fetchCoords(search);
}


//////////////////////////////////////////////////////

initSearchHistory();
searchForm.addEventListener('submit', submitForm);
searchHistoryContainer.addEventListener('click', handleSearchHistoryClick);
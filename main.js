
// This is for the light and dark mode and saving them in the LocalStorage 
const switchButton = document.querySelector(".toggle");
const icon = document.querySelector(".theIcon");

let theMode = localStorage.getItem("mode");
if(theMode && theMode == "dark") {
    document.body.classList.add("dark");
}

let theIcon = localStorage.getItem("icon");
if(theIcon && theIcon == "sun") {
    icon.classList.add("fa-sun");
    icon.classList.remove("fa-moon");  
}

switchButton.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if( ! document.body.classList.contains("dark")) {
        icon.classList.add("fa-moon");
        icon.classList.remove("fa-sun");
        localStorage.setItem("mode", "Light");
        localStorage.setItem("icon", "moon");
    }
    else {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
        localStorage.setItem("mode", "dark");
        localStorage.setItem("icon", "sun");
    }
});


// --------------------------------------------

const openSearchMob = document.querySelector(".openS");
const closeSearchMob = document.querySelector(".closeS");
const searchView = document.querySelector(".search-view");
const switchMode = document.querySelector(".switch");

openSearchMob.addEventListener("click", () => {
    searchView.classList.add("open");
    switchMode.style.display = "none";
    closeSearchMob.addEventListener("click", () => {
        searchView.classList.remove("open");
        switchMode.style.display = "block";
    })
});


// --------------------------------------------


const apiKey = "530aca9b06ead138e7d1908ae8acd9ab";

/**
 * Fetch data from the API
 * @param {string} url API url
 * @param {function} callBack Callback function to handle the data
 */

async function fetchData(url, callBack) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (typeof callBack === "function") {
            callBack(data);
        }
    }
    catch (error) {
        console.error("Error fetching data:", error);
    }
}


const urlBuilder = {
    currentWeather(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    },
    forecast(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    },
    airPollution(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    },
    reversoGeo(lat, lon) {
        return `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${apiKey}`;
    },
    geo(query) {
        return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;
    }
};


const search_Input = document.querySelector("[data-search-field]");
const search_Result_Container = document.querySelector("[data-search-result]");
const search_Result_Output = document.querySelector("[data-search-list]");


// Event listener for search input changes to take the city name 
search_Input.addEventListener("input", () => {
    search_Result_Output.style.display = "block";
    const query = search_Input.value.trim();
    console.log(query);
    if (query.length > 0) {
        search_Result_Output.style.display = "block";
        const geoUrl = urlBuilder.geo(query);
        fetchData(geoUrl, (data) => {
            displaySearchResults(data);
        });
    } 
    else {
        search_Input.classList.remove("show");
        search_Result_Output.style.display = "block";
        clearSearchResults();
    }
});


// Function to display search results to the user and only up to 5 cites
function displaySearchResults(data) {
    const search_Result_Output = document.querySelector("[data-search-list]");
    search_Result_Output.innerHTML = "";

    for (let i = 0; i < Math.min(data.length, 5); i++) {
        let city = data[i].name;
        let country = data[i].country;
        let state = data[i].state;

        const listItem = document.createElement("li");
        listItem.classList.add("view-item");
        listItem.innerHTML = `
            <i class="fa-solid fa-location-dot"></i>
            <div>
                <p class="item-title">${city}</p>
                <p class="item-subtitle label-2">${state ||""}, ${country}</p>
            </div>
        `;

        listItem.addEventListener("click", () => {
            getLatLon(data[i].lat, data[i].lon)();
        });
        search_Result_Output.appendChild(listItem);

    }
    if(search_Result_Output.childElementCount > 0) {
        search_Input.classList.add("show");
    }
    else {
        search_Input.classList.remove("show");
    }
}

function clearSearchResults() {
    search_Result_Output.innerHTML = "";
    search_Input.value = ""; 
    search_Input.classList.remove("show");
}


// Function to get latitude and longitude of a selected city and display the weather of it.
function getLatLon(latitude, longitude) {
    return () => {
        clearSearchResults();
        searchView.classList.remove("open");
        displayCurrentWeather(latitude, longitude);
        displayAirPollution(latitude, longitude);
        displayAllOtherInfo(latitude, longitude);
        displayForecast(latitude, longitude);
        switchMode.style.display = "block";
    };
}

// If no city is selected, the default location shown will be for Cairo, Egypt.
function display() {
    let defaultLatitude = 30.0626;
    let defaultLongitude = 31.2497;

    displayCurrentWeather(defaultLatitude, defaultLongitude);
    displayAirPollution(defaultLatitude, defaultLongitude);
    displayAllOtherInfo(defaultLatitude, defaultLongitude);
    displayForecast(defaultLatitude, defaultLongitude);
}

window.onload = function() {
    display();
};


// function that uses latitude and longitude to display the current
//   weather regarding the selected city through search
function displayCurrentWeather(latitude, longitude) {
    const currentWeatherUrl = urlBuilder.currentWeather(latitude, longitude);
    const degreeNow = document.querySelector(".degree-now");
    const weatherIcon = document.querySelector(".weather-icon");
    const weatherState = document.querySelector(".wState");
    const theDate = document.querySelector(".theDate");
    const cityAndCountry = document.querySelector(".cityAndCountry");

    fetchData(currentWeatherUrl, (data) => {
        degreeNow.innerHTML = Math.round(data.main.temp) + `°c`;
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherIcon.title = data.weather[0].description;
        weatherState.innerHTML = data.weather[0].description;
        cityAndCountry.innerHTML = `${data.name}, ${data.sys.country}`; 
    });
}

// This function to display 5 Days Forecast And AND the daily forecast
function displayForecast(latitude, longitude) {
    const forecastUrl = urlBuilder.forecast(latitude, longitude);
    fetchData(forecastUrl, (data) => {

        const tempContainer = document.querySelector("[data-temp]");
        const windContainer = document.querySelector("[data-wind]");

        tempContainer.innerHTML = "";
        windContainer.innerHTML = "";
        for(let i = 0; i < 8 ; i++) {
            const timestamp = data.list[i].dt;
            const date = new Date(timestamp * 1000);
            const options = { hour: '2-digit', hour12: true };
            const formattedTime = date.toLocaleTimeString([], options);

            const tempLi = document.createElement("li");
            tempLi.classList.add("slider-item");
            tempLi.innerHTML = `
            <p>${formattedTime}</p>
            <img src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@4x.png"
            alt="${data.list[i].weather[0].description}"
            title="${data.list[i].weather[0].description}"
            loading="lazy">
            <p>${parseInt(data.list[i].main.temp)} °c</p>`;
            tempContainer.appendChild(tempLi);

            const windLi = document.createElement("li");
            windLi.classList.add("slider-item");
            windLi.innerHTML = `
            <p>${formattedTime}</p>
            <img src="images/direction.png"
            alt="direction"
            title="direction"
            loading="lazy"
            style="transform: rotate(${data.list[i].wind.deg - 180}deg)">
            <p>${parseInt(mps_to_kmh(data.list[i].wind.speed))} Km/h</p>`;
            windContainer.appendChild(windLi);
        }


        const mainCard = document.querySelector(".card-wrapper");
        mainCard.innerHTML = "";
        
        for(let i = 7; i < data.list.length; i+=8) {
            const timestamp = data.list[i].dt;
            const date = new Date(timestamp * 1000);
            const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
            const monthName = date.toLocaleString('en-US', { month: 'long' });

            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
            <div class="icon-wrapper">
                <img src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@4x.png"
                    alt="${data.list[i].weather[0].description}" title="${data.list[i].weather[0].description}"
                    class="weather-icon">
                <span>${parseInt(data.list[i].main.temp_max)}°c</span>
            </div>
            <p class="label-one">${date.getDate()}  ${monthName}</p>
            <p class="label-one">${dayOfWeek}</p> `;

            mainCard.appendChild(card);
        }

    })
}

// This is mainly for the green badge "For the title" in the Air Quality Index Section
const aqiText = {
    1: {
        level: "Good",
        message: `The air quality is considered good, and there is little to no health risk associated
        with the air pollution. The air is clean and suitable for outdoor activities.`
    },
    2: {
        level: "Fair",
        message: `The air quality is acceptable, but there may be a slight health concern for certain individuals,
        particularly those who are sensitive to air pollution. It is generally safe for most people
        to be outdoors.`
    },
    3: {
        level: "Moderate",
        message: `The air quality is moderately polluted, and there may be a noticeable impact on air quality.
        Sensitive individuals, such as those with respiratory conditions, may experience discomfort or health effects.
        It is recommended to limit prolonged exposure in outdoor areas with poor air quality.`
    },
    4: {
        level: "Poor",
        message: `The air quality is poor, and there is a significant level of air pollution present.
        It can adversely affect the health of sensitive individuals and may cause respiratory symptoms or other health issues.
        It is advisable to reduce outdoor activities, especially for vulnerable groups.`
    },
    5: {
        level: "Very Poor",
        message: `The air quality is very poor, and the pollution levels are high.
        It poses a severe health risk, particularly for individuals with respiratory or heart conditions, children,
        and the elderly. It is strongly recommended to avoid outdoor activities and stay indoors in well-ventilated areas.`
    }
};

// This is for the Air Quality Index section in Today Highlights
function displayAirPollution(latitude, longitude) {
    const airPollutionUrl = urlBuilder.airPollution(latitude, longitude);
    fetchData(airPollutionUrl, (data) => {
        let card = document.querySelector(".theAirPollution");
        card.innerHTML = `
        <ul class="card-list flex theAirPollution">
            <li class="card-item">
                <p class="label">PM<sub>2.5</sub></p>
                <p class="title">${(data.list[0].components.pm2_5).toPrecision(3)}</p>
            </li>
            <li class="card-item">
                <p class="label">SO<sub>2</sub></p>
                <p class="title">${(data.list[0].components.so2).toPrecision(3)}</p>
            </li>
            <li class="card-item">
                <p class="label">NO<sub>2</sub></p>
                <p class="title">${(data.list[0].components.no2).toPrecision(3)}</p>
            </li>
            <li class="card-item">
                <p class="label">O<sub>3</sub></p>
                <p class="title">${(data.list[0].components.o3).toPrecision(3)}</p>
            </li>
        </ul>`;
        document.querySelector(".badge").innerHTML = aqiText[data.list[0].main.aqi].level; 
        document.querySelector(".badge").title =  aqiText[data.list[0].main.aqi].message
    });
}

// This function to display all other info in the Today Highlights except air Quality Index section
function displayAllOtherInfo(latitude, longitude) {
    const theUrl = urlBuilder.currentWeather(latitude, longitude);
    fetchData(theUrl, (data) => {
        document.querySelector(".sunriseTime").innerHTML =
        formatTime(data.sys.sunrise, data.timezone);
        document.querySelector(".sunsetTime").innerHTML =
        formatTime(data.sys.sunset, data.timezone);
        document.querySelector(".second-row").innerHTML = `
            <div class="humidity box">
                <div class="top">
                    <h3>Humidity</h3>
                </div>
                <div class="bottom flex">
                    <i class="fa-solid fa-droplet"></i>
                    <p class="title">${data.main.humidity}<small>%</small></p>
                </div>
            </div>
            <div class="pressure box">
                <div class="top">
                    <h3>pressure</h3>
                </div>
                <div class="bottom flex">
                    <i class="fa-solid fa-water"></i>
                    <p class="title">${data.main.pressure}<small>hPa</small></p>
                </div>
            </div>
            <div class="Visibility box">
                <div class="top">
                    <h3>Visibility</h3>
                </div>
                <div class="bottom flex">
                    <i class="fa-regular fa-eye"></i>
                    <p class="title">${data.visibility / 1000}<small>km</small></p>
                </div>
            </div>
            <div class="feels-like box">
                <div class="top">
                    <h3>Feels Like</h3>
                </div>
                <div class="bottom flex">
                    <i class="fa-solid fa-temperature-half"></i>
                    <p class="title">${(data.main.feels_like).toFixed(1)}°c</p>
                </div>
            </div>`;
    });
}


// This function  to get the current location of the user and display it's weather
const successCallback = (position) => {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    displayCurrentWeather(latitude, longitude);
    displayAirPollution(latitude, longitude);
    displayAllOtherInfo(latitude, longitude);
    displayForecast(latitude, longitude);

    document.querySelector("[data-current-location-btn]").style.backgroundColor =" var(--search-color)";
    document.querySelector("[data-current-location-btn]").style.boxShadow = "none";
};

const errorCallback = (error) => {
    console.log(error);
};

const options = {
    enableHighAccuracy: true,
};

const getLocationButton = document.querySelector("[data-current-location-btn]"); 

getLocationButton.addEventListener("click", () => {
    if (window.navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    } 
    else {
        alert("Geolocation is not supported by this browser.");
    }
});


const weekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Function to display the date in the current weather card
function formatDate() {
    const today = new Date();
    const weekday = weekDayNames[today.getDay()];
    const month = monthNames[today.getMonth()];
    const day = today.getDate();
    const theDate = document.querySelector(".theDate");
    theDate.innerHTML =  `${weekday}, ${month} ${day}`;
}
formatDate();

// Function to use it in the sunrise and sunset time only
function formatTime(timeUnix, timezone) {
    const date = new Date((timeUnix + timezone) * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const amPm = hours >= 12 ? "PM" : "AM";
    return `${hours % 12 || 12}:${minutes} ${amPm}`;
}
formatTime();


/*
    What is the formula for mps to km/h (kilometres per hour)?
        To convert m/sec into km/hr: Multiply speed in m/s with 3600.
        Divide the results by 1000. The result is the speed in kilometers per hour.
*/
function mps_to_kmh(mps) {
    const mph = mps * 3600;
    return mph / 1000;
}



// Abdelrahman Alsayed ...
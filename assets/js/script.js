class CityWeather {
    date = new Date();
    icon = {
        name: '',
        description: '',
    }
    temp = 0;
    humidity = 0;
    constructor(temp, humidity) {
        this.temp = temp;
        this.humidity = humidity;
    }

    setDate(openWeatherDate) {
        this.date = new Date(openWeatherDate * 1000);
        return this;
    }
    setIconName(iconName) {
        this.icon.name = iconName.slice(0, iconName.length - 1) + this.genIconEnd();
        return this;
    }
    setIconDescription(iconDescription) {
        this.icon.description = iconDescription;
        return this;
    }
};

CityWeather.prototype.genIconEnd = function () {
    const hour = this.date.getHours();
    return (hour >= 20 && hour < 6) ? 'n' : 'd';
};

class CurrentWeather extends CityWeather {
    windSpeed = 0;
    uv = {
        index: 0,
        color: '',
    };
    constructor(temp, humidity, windSpeed) {
        super(temp, humidity);
        this.windSpeed = windSpeed;
    }

    setUV(uvIndex) {
        this.uv.index = uvIndex;
        this.uv.color = this.generateUVIndexColor(uvIndex);
        return this;
    }
};

CurrentWeather.prototype.generateUVIndexColor = function (uvIndex) {
    if (uvIndex <= 2) {
        return 'bg-secondary text-white';
    } else if (uvIndex <= 5) {
        return 'bg-dark text-white';
    } else if (uvIndex <= 7) {
        return 'bg-success text-white';
    } else if (uvIndex <= 10) {
        return 'bg-warning text-dark';
    } else {
        return 'bg-danger text-white';
    }
};

class WeatherData {
    city = {
        cityName: '',
        lat: '',
        lon: '',
    }

    currentDay;
    nextFiveDays = [];

    constructor(cityName, lat, lon) {
        this.city.cityName = cityName;
        this.city.lat = lat;
        this.city.lon = lon;
    }

    setCurrentDay(currentDay) {
        this.currentDay = currentDay;
    }

    appendFiveDays(day) {
        this.nextFiveDays.push(day);
    }
};

WeatherData.prototype.setDays = function (dayList) {
    dayList.forEach(function (day, index) {
        if (index === 0) {
            this.currentDay.setUV(day.uvi);
        } else if (index <= 5) {
            let nextFiveDay = new CityWeather(
                day.temp.day,
                day.humidity)
                .setDate(day.dt)
                .setIconName(day.weather[0].icon)
                .setIconDescription(day.weather[0].description);
            this.appendFiveDays(nextFiveDay);
        }
    }.bind(this));
    return this;
}

function submitSearch(event) {
    event.preventDefault();

    const userInput = getUserInput();

    if (userInput) {
        startWeatherData(userInput);
    } else {
        document.getElementById('city-name').value = '';
    }
};

function getUserInput() {
    let userInput = document.getElementById('city-name').value;
    userInput = userInput.trim();
    return userInput;
}

const API_KEY = 'a033a2c841a0c9e354ab4e4c2deaabd1';

function startWeatherData(cityName) {
    if (!isCurrentlyDisplayed(cityName)) {
        fetchData(curWeatherURL(cityName), procCurWeatherData);
    }
};

function fetchData(queryURL, nextAction) {
    fetch(queryURL)
        .then(function (response) {
            return response.json();
        }).then(nextAction);
};

function procCurWeatherData(data) {
    if (data.cod != 200) {

    } else {
        const weatherData = new WeatherData(
            data.name,
            data.coord.lat,
            data.coord.lon);
        const currentDay = new CurrentWeather(
            data.main.temp,
            data.main.humidity,
            data.wind.speed)
            .setDate(data.dt)
            .setIconName(data.weather[0].icon)
            .setIconDescription(data.weather[0].description);
        weatherData.setCurrentDay(currentDay);

        fetchData(oneCallURL(data.coord.lat, data.coord.lon), function (data) {
            procOneCallData(data, weatherData);
        });
    }
};

function procOneCallData(data, weatherData) {
    const weatherObj = weatherData;
    weatherObj.setDays(data.daily);

    displayInfo(weatherObj);
}

function curWeatherURL(cityName) {
    return 'https://api.openweathermap.org/data/2.5/weather?'
        + `q=${cityName}`
        + `&units=imperial`
        + `&appid=${API_KEY}`;
};

function oneCallURL(lat, lon) {
    return 'https://api.openweathermap.org/data/2.5/onecall?'
        + `lat=${lat}`
        + `&lon=${lon}`
        + '&units=imperial'
        + `&appid=${API_KEY}`;
}

function displayInfo(weatherObj) {
    resetCityInfo(weatherObj.city.cityName);
    dispOverview(weatherObj.currentDay, weatherObj.city.cityName);
    displayFiveDay(weatherObj.nextFiveDays);

};

function resetCityInfo(cityName) {
    const cityInfo = document.getElementById('city-info');
    cityInfo.setAttribute('data-city', cityName);
    cityInfo.innerHTML = '';

};

function dispOverview(currentDay, cityName) {
    const cityInfo = document.getElementById('city-info');

    cityInfo.innerHTML +=
        `<div class="row mb-4">
    <div class="col">
      <div class="card" id="display-info">
        <div class="card-body p-0">
          <div class="card-body pt-0" id="city-info" data-city="${cityName}">
            <h2 class="d-inline-block mr-3 font-weight-bold">${cityName} ${formatDate(currentDay.date)}</h2>
            <img class="d-inline-block" src="https://openweathermap.org/img/wn/${currentDay.icon.name}@2x.png" alt="${currentDay.icon.description}">
            <p>Temperature: ${currentDay.temp} &#176;F</p>
            <p>Humidity: ${currentDay.humidity}&#37;</p>
            <p>Wind Speed: ${currentDay.windSpeed} MPH</p>
            <p>UV Index: <span id="current-uv-index" class="${currentDay.uv.color} py-1 px-2 rounded">${currentDay.uv.index}</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
};

function displayFiveDay(dayList) {
    const cityInfo = document.getElementById('city-info');
    cityInfo.innerHTML +=
        `<div class="row">
      <div class="col">
        <h3>5-Day Forecast:</h3>
          <div class="row" id="five-day-forecast-cards">
          </div>
        </div>
      </div>`;
    const fiveDayForecastCards = document.getElementById('five-day-forecast-cards');
    for (day of dayList) {
        fiveDayForecastCards.innerHTML +=
            `<div class="col-lg" id="five-day-weather-card">
        <div class="card bg-primary text-white">
          <div class="card-body d-flex flex-column justify-content-center align-items-center">
            <p class="h5">${formatDate2(day.date)}</p>
            <img class="mb-3" src="https://openweathermap.org/img/wn/${day.icon.name}@2x.png" alt="${day.icon.description}">
            <p>Temp: ${day.temp} &#176;F</p>
            <p>Humidity: ${day.humidity}&#37;</p>
          </div>
        </div>
      </div>`;
    }
};

function isCurrentlyDisplayed(cityName) {
    const currentDis = document.getElementById('city-info').dataset.city;
    return currentDis === cityName ? true : false;
};

function formatDate(date) {
    const newDate = new Date(date);
    return `(${newDate.getMonth() + 1}/${newDate.getDate()}/${newDate.getFullYear()})`;
};

function formatDate2(date) {
    const newDate = new Date(date);
    return `${newDate.getMonth() + 1}/${newDate.getDate()}/${newDate.getFullYear()}`;
};

document.getElementById('search-city').addEventListener('submit', submitSearch);
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

    constructor(cityName, lat, lon) {
        this.city.cityName = cityName;
        this.city.lat = lat;
        this.city.lon = lon;
    }

    setCurrentDay(currentDay) {
        this.currentDay = currentDay;
    }
};

WeatherData.prototype.setDays = function (dayList) {
    dayList.forEach(function(day, index) {
        if (index === 0) {
            this.currentDay.setUV(day.uvi);
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

const API_KEY = '4e700b938e7abb20c0a4650d77ff125e';

function startWeatherData(cityName) {
    if(!isCurrentlyDisplayed(cityName)) {
        debugger
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
        <div class="card-body">
          <div class="card-body" id="city-info" data-city="${cityName}">
            <h2 class="d-inline-block mr-3">${cityName} ${formatDate(currentDay.date)}</h2>
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

function isCurrentlyDisplayed(cityName) {
    const currentDis = document.getElementById('city-info').dataset.city;
    return currentDis === cityName ? true : false;
};

function formatDate(date) {
    const newDate = new Date(date);
    return `(${newDate.getMonth() + 1}/${newDate.getDate()}/${newDate.getFullYear()})`;
};


document.getElementById('search-city').addEventListener('submit', submitSearch);
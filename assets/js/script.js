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
        this.icon.name = iconName.slice(0, iconName.length - 1) + this.generateIconEnding();
        return this;
    }
    setIconDescription(iconDescription) {
        this.icon.description = iconDescription;
        return this;
    }
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

    displayInformation(weatherObj);
}

function curWeatherURL(cityName) {
    return 'https://api.openweathermap.org/data/2.5/weather?'
        + `q=${cityName}`
        + `&units=imperial`
        + `&appid=${API_KEY}`;
};

document.getElementById('search-city').addEventListener('submit', submitSearch);
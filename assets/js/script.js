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


document.getElementById('search-city').addEventListener('submit', submitSearch);
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


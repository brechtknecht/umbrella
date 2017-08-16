//TODO: Save Temp Data into Object

//fetches all data into temporary object
var tempWeatherData = {
    temperature: null,
    maxTemperature: null,
    minTemperature: null,
    description: null,
    currentWeatherId: null,
    rainAmount: null,
    rainStartHour: null,
    rainEndHour: null
}


class WeatherData {
    constructor(temperature, maxTemperature, minTemperature, description, currentWeatherId, rainAmount, rainStartHour, rainEndHour) {
        this.temperature = temperature;
        this.maxTemperature = maxTemperature;
        this.minTemperature = minTemperature;
        this.description = description;
        this.currentWeatherId = currentWeatherId;
        var raindata = {
            rainAmount: rainAmount,
            startTime: rainStartHour,
            endTime: rainEndHour
        }
        this.rainData = raindata;
    }
}

//enumerate types for pushing some functions
var action = {
    PUSH_TEMPLATE_OVERVIEW: 0,
}


//enumerate Weathertypes for weather array to access weather icons
var weather = {
    WEATHER_RAINY: 0,
    WEATHER_SNOWY: 1,
    WEATHER_STORMY: 2,
    WEATHER_SUNNY: 3,
    WEATHER_CLOUDY: 4
}

var imagesURLArray = ['images/weatherIcons/rainy.svg',
                      'images/weatherIcons/snowy.svg',
                      'images/weatherIcons/stormy.svg',
                      'images/weatherIcons/sunny.svg',
                      'images/weatherIcons/cloudy.svg'];


function getCurrentWeatherWithLocation(action) {
    navigator.geolocation.getCurrentPosition(function (location) {
        $.get("http://api.openweathermap.org/data/2.5/weather?lat=" +
            location.coords.latitude +
            "&lon=" +
            location.coords.longitude +
            "&APPID=5c7868126371809f25bf57c76c2c90b6&lang=de&units=metric"

            /*"http://api.openweathermap.org/data/2.5/weather?lat=50.896111&lon=14.807222&APPID=5c7868126371809f25bf57c76c2c90b6&lang=de&units=metric"*/

            ,
            function (data) {
                console.log(data);
                var location = data.name;
                var weatherDescription = data.weather[0].description;
                var maxTemperature = data.main.temp_max;
                var minTemperature = data.main.temp_min;
                var currentTemperature = data.main.temp;
                var currentWeatherId = data.weather[0].id;
                var windSpeed = data.wind.speed;
                var currentWeatherType;
                var temperature = (maxTemperature + minTemperature) / 2;

                //fomular for feeled temperature
                var feelTemperature =
                    13.12 + 0.6215 * temperature - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temperature * Math.pow(windSpeed, 0.16);

                console.log('Gefühlte Temperatur: ' + feelTemperature + '°C');

                tempWeatherData.temperature = feelTemperature;
                tempWeatherData.currentWeatherId = currentWeatherId;
                tempWeatherData.description = weatherDescription;
                tempWeatherData.maxTemperature = maxTemperature;
                tempWeatherData.minTemperature = minTemperature;



                //find out what weather it is right now

                //Group 2xx: Thunderstorm
                if (currentWeatherId >= 200 && currentWeatherId <= 232) {
                    currentWeatherType = weather.WEATHER_STORMY;
                }

                //Group 3xx: Drizzle
                //missing

                //Group 5xx: Rain
                if (currentWeatherId >= 500 && currentWeatherId <= 531) {
                    currentWeatherType = weather.WEATHER_RAINY;
                }

                //Group 6xx: Snow
                if (currentWeatherId >= 600 && currentWeatherId <= 622) {
                    currentWeatherType = weather.WEATHER_RAINY;
                }

                //Group 7xx: Atmosphere
                //missing

                //Group 800: Clear
                if (currentWeatherId == 800) {
                    currentWeatherType = weather.WEATHER_SUNNY;
                }

                //Group 80x: Clouds
                if (currentWeatherId >= 801 && currentWeatherId <= 804) {
                    currentWeatherType = weather.WEATHER_CLOUDY;
                }

                //Group 90x: Extreme
                if (currentWeatherId > 900 && currentWeatherId <= 906) {
                    currentWeatherType = weather.WEATHER_CLOUDY;
                }

                //Group 9xx: Additional
                //missing



                //do the action on given action type
                if (action === 0) {
                    overview_template_controller_push(location, weatherDescription, currentTemperature, currentWeatherType);
                }


            });
    });
}

function getForecastWeatherWithLocation(action) {
    navigator.geolocation.getCurrentPosition(function (location) {
        $.get("http://api.openweathermap.org/data/2.5/forecast?lat=" +
            location.coords.latitude +
            "&lon=" +
            location.coords.longitude +
            "&APPID=5c7868126371809f25bf57c76c2c90b6&lang=de&units=metric",
            function (data) {
                rainForecast(data);
            });
    });
}

function rainForecast(data) {
    var maxArray = Math.ceil((24 - (new Date().getHours())) / 3);
    for (var i = 0; i < maxArray; i++) {
        if (!jQuery.isEmptyObject(data.list[i].rain)) {
            //time with rain data for the last 3 hours in unix timestamp
            var rainTime = data.list[i].dt;
            var rainReference = data.list[i].rain;
            var rainAmount = rainReference[Object.keys(rainReference)[0]];
            var rainEndHour = new Date(rainTime * 1000).getHours();
            var rainStartHour = rainEndHour - 3;

            tempWeatherData.rainAmount = rainAmount;
            tempWeatherData.rainStartHour = rainStartHour;
            tempWeatherData.rainEndHour = rainEndHour;

            //Zwischen 15:00 Uhr und 18:00 Uhr soll es 4mm regnen.
            console.log('Zwischen ' + rainStartHour + ':00 Uhr' + ' und ' + rainEndHour + ':00 Uhr soll es ' + rainAmount + 'mm regnen.');
        }
    }
}

function determineClothesFromWeatherData() {
    //Creates Object from given Weatherdata
    var todaysWeatherData = new WeatherData(tempWeatherData.temperature, tempWeatherData.maxTemperature, tempWeatherData.minTemperature, tempWeatherData.description, tempWeatherData.currentWeatherId, tempWeatherData.rainAmount, tempWeatherData.rainStartHour, tempWeatherData.rainEndHour);


    var temperature = tempWeatherData.temperature;
    var weatherId = tempWeatherData.currentWeatherId;
    console.log(weatherId);
    if(!weatherId){
        console.log("Couldn't fetch weather ID. Application does not work correctly!");
    }

    var oberteilArray = [];
    var unterteilArray = [];
    var schuhArray = [];
    var spezialArray = [];

    //get all compatible clothes for given temperature and weatherconditions
    oberteilArray = getOberteilArray(temperature, weatherId, oberteilArray);
    unterteilArray = getUnterteilArray(temperature, weatherId, unterteilArray);
    schuhArray = getSchuhArray(temperature, weatherId, schuhArray);
    spezialArray = getSpezialArray(weatherId, spezialArray);
    //DONE   
    
    console.log(oberteilArray);
    console.log(unterteilArray);
    console.log(schuhArray);
    console.log(spezialArray);

}

function getOberteilArray(temperature, weatherId, oberteilArray) {
    for (var i = 0; i < Object.values(clothesDatabase.Oberteile).length; i++) {
        var oberteil = Object.values(clothesDatabase.Oberteile)[i];
        switch (true) {
            case (tempWeatherData.temperature > -50 && temperature < 17):
                if (oberteil.temperatureCold) {
                    var weatherConditions = Object.values(oberteil.weatherConditions);
                    for (var k = 0; k < weatherConditions.length; k++) {
                        if (weatherConditions[k] == weatherId) {
                            oberteilArray.push(oberteil);
                        }
                    }
                }
                break;
            case (tempWeatherData.temperature > 18 && temperature < 24):
                if (oberteil.temperatureMiddle) {
                    var weatherConditions = Object.values(oberteil.weatherConditions);
                    for (var k = 0; k < weatherConditions.length; k++) {
                        if (weatherConditions[k] == weatherId) {
                            oberteilArray.push(oberteil);
                        }
                    }
                }
                break;
            case (tempWeatherData.temperature > 25 && temperature < 30):
                if (oberteil.temperatureWarm) {
                    var weatherConditions = Object.values(oberteil.weatherConditions);
                    for (var k = 0; k < weatherConditions.length; k++) {
                        if (weatherConditions[k] == weatherId) {
                            oberteilArray.push(oberteil);
                        }
                    }
                }
                break;
            case (tempWeatherData.temperature > 31 && temperature < 41):
                if (oberteil.temeratureHot) {
                    var weatherConditions = Object.values(oberteil.weatherConditions);
                    for (var k = 0; k < weatherConditions.length; k++) {
                        if (weatherConditions[k] == weatherId) {
                            oberteilArray.push(oberteil);
                        }
                    }
                }
                break;
            default:
                console.log('Nicht zuzuordnende Temperatur');
        }
    }
    return oberteilArray;
}

function getUnterteilArray(temperature, weatherId, unterteilArray) {
    for (var i = 0; i < Object.values(clothesDatabase.Unterteile).length; i++) {
        var unterteil = Object.values(clothesDatabase.Unterteile)[i];
        switch (true) {
            case (tempWeatherData.temperature > -50 && temperature < 17):
                if (unterteil.temperatureCold) {
                    var weatherConditions = Object.values(unterteil.weatherConditions);
                    for (var k = 0; k < weatherConditions.length; k++) {
                        if (weatherConditions[k] == weatherId) {
                            unterteilArray.push(unterteil);
                            break;
                        }
                    }
                }
                break;
            case (tempWeatherData.temperature > 18 && temperature < 24):
                if (unterteil.temperatureMiddle) {
                    var weatherConditions = Object.values(unterteil.weatherConditions);
                    for (var k = 0; k < weatherConditions.length; k++) {
                        if (weatherConditions[k] == weatherId) {
                            unterteilArray.push(unterteil);
                        }
                    }
                }
                break;
            case (tempWeatherData.temperature > 25 && temperature < 30):
                if (unterteil.temperatureWarm) {
                    var weatherConditions = Object.values(unterteil.weatherConditions);
                    for (var k = 0; k < weatherConditions.length; k++) {
                        if (weatherConditions[k] == weatherId) {
                            unterteilArray.push(unterteil);
                        }
                    }
                }
                break;
            case (tempWeatherData.temperature > 31 && temperature < 41):
                if (unterteil.temeratureHot) {
                    var weatherConditions = Object.values(unterteil.weatherConditions);
                    for (var k = 0; k < weatherConditions.length; k++) {
                        if (weatherConditions[k] == weatherId) {
                            unterteilArray.push(unterteil);
                        }
                    }
                }
                break;
            default:
                console.log('Nicht zuzuordnende Temperatur');
        }
    }
    return unterteilArray;
}

function getSchuhArray(temperature, weatherId, schuhArray) {
    for (var i = 0; i < Object.values(clothesDatabase.Schuhe).length; i++) {
        var schuh = Object.values(clothesDatabase.Schuhe)[i];
        switch (true) {
            case (tempWeatherData.temperature > -50 && temperature < 17):
                if (schuh.temperatureCold) {
                    var weatherConditions = Object.values(schuh.weatherConditions);
                    for (var k = 0; k < weatherConditions.length; k++) {
                        if (weatherConditions[k] == weatherId) {
                            schuhArray.push(schuh);
                        }
                    }
                }
                break;
            case (tempWeatherData.temperature > 18 && temperature < 24):
                if (schuh.temperatureMiddle) {
                    var weatherConditions = Object.values(schuh.weatherConditions);
                    for (var k = 0; k < weatherConditions.length; k++) {
                        if (weatherConditions[k] == weatherId) {
                            schuhArray.push(schuh);
                        }
                    }
                }
                break;
            case (tempWeatherData.temperature > 25 && temperature < 30):
                if (schuh.temperatureWarm) {
                    var weatherConditions = Object.values(schuh.weatherConditions);
                    for (var k = 0; k < weatherConditions.length; k++) {
                        if (weatherConditions[k] == weatherId) {
                            schuhArray.push(schuh);
                        }
                    }
                }
                break;
            case (tempWeatherData.temperature > 31 && temperature < 41):
                if (schuh.temeratureHot) {
                    var weatherConditions = Object.values(schuh.weatherConditions);
                    for (var k = 0; k < weatherConditions.length; k++) {
                        if (weatherConditions[k] == weatherId) {
                            schuhArray.push(schuh);
                        }
                    }
                }
                break;
            default:
                console.log('Nicht zuzuordnende Temperatur');
        }
    }
    return schuhArray;
}

function getSpezialArray(weatherId, spezialArray) {
    for (var i = 0; i < Object.values(clothesDatabase.Spezialteile).length; i++) {
        var spezial = Object.values(clothesDatabase.Spezialteile)[i];
        var weatherConditions = Object.values(spezial.weatherConditions);
        for (var k = 0; k < weatherConditions.length; k++) {
            if (weatherConditions[k] == weatherId) {
                spezialArray.push(spezial);
            }
        }
    }
    return spezialArray;
}

function overview_template_controller_push(location, weatherDescription, currentTemperature, WEATHER_TYPE) {
    $('.currentWeather > .weatherIcon').html("<img src=" + imagesURLArray[WEATHER_TYPE] + ">");
    $('.currentWeather > .weatherDescription').html('<p>' + location + ' - ' + weatherDescription + ' - ' + currentTemperature + '°C' + '</p>');
}

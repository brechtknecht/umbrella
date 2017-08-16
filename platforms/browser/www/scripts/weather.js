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

            /*
            console.log('Zwischen ' + rainStartHour + ':00 Uhr' + ' und ' + rainEndHour + ':00 Uhr soll es ' + rainAmount + 'mm regnen.');*/
        }
    }
}

function determineClothesFromWeatherData() {
    //Creates Object from given Weatherdata
    var todaysWeatherData = new WeatherData(tempWeatherData.temperature, tempWeatherData.maxTemperature, tempWeatherData.minTemperature, tempWeatherData.description, tempWeatherData.currentWeatherId, tempWeatherData.rainAmount, tempWeatherData.rainStartHour, tempWeatherData.rainEndHour);


    var temperature = tempWeatherData.temperature;
    var weatherId = tempWeatherData.currentWeatherId;
    if (!weatherId) {
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


    suggestion_template_controller_push(oberteilArray, unterteilArray, schuhArray, spezialArray);

}

function getOberteilArray(temperature, weatherId, oberteilArray) {
    Object.keys(clothesDatabase.Oberteile).map(function (key) {
        var oberteil = clothesDatabase.Oberteile[key];
        var weatherConditions = Object.keys(oberteil.weatherConditions).map(function (key) {
            return oberteil.weatherConditions[key];
        });
        
        temperature = Math.round(temperature);
        
        Object.keys(databaseConfiguration.temperatureThresholds).map(function (thresholdId) {
            var lowTemperature = databaseConfiguration.temperatureThresholds[thresholdId][0];
            var highTemperature = databaseConfiguration.temperatureThresholds[thresholdId][1];
            if (temperature >= lowTemperature && temperature <= highTemperature) {
                if (oberteil[thresholdId]) {
                    Object.keys(weatherConditions).map(function (key) {
                        if (weatherConditions[key] == weatherId) {
                            oberteilArray.push(oberteil);
                        }
                    });
                }
            }
        });


    });
    return oberteilArray;
}

function getUnterteilArray(temperature, weatherId, unterteilArray) {
    Object.keys(clothesDatabase.Unterteile).map(function (key) {
        var unterteil = clothesDatabase.Unterteile[key];
        var weatherConditions = Object.keys(unterteil.weatherConditions).map(function (key) {
            return unterteil.weatherConditions[key];
        });
        
        temperature = Math.round(temperature);
        
        console.log(databaseConfiguration);
        
        Object.keys(databaseConfiguration.temperatureThresholds).map(function (thresholdId) {
            var lowTemperature = databaseConfiguration.temperatureThresholds[thresholdId][0];
            var highTemperature = databaseConfiguration.temperatureThresholds[thresholdId][1];

            if (temperature >= lowTemperature && temperature <= highTemperature) {
                if (unterteil[thresholdId]) {
                    Object.keys(weatherConditions).map(function (key) {
                        if (weatherConditions[key] == weatherId) {
                            unterteilArray.push(unterteil);
                        }
                    });
                }
            }
        });


    });
    return unterteilArray;
}

function getSchuhArray(temperature, weatherId, schuhArray) {
    Object.keys(clothesDatabase.Schuhe).map(function (key) {
        var schuh = clothesDatabase.Schuhe[key];
        var weatherConditions = Object.keys(schuh.weatherConditions).map(function (key) {
            return schuh.weatherConditions[key];
        });

        temperature = Math.round(temperature);
        
        Object.keys(databaseConfiguration.temperatureThresholds).map(function (thresholdId) {
            var lowTemperature = databaseConfiguration.temperatureThresholds[thresholdId][0];
            var highTemperature = databaseConfiguration.temperatureThresholds[thresholdId][1];
            console.log(temperature);
            console.log(lowTemperature);
            console.log(highTemperature);
            if (temperature >= lowTemperature && temperature <= highTemperature) {
                if (schuh[thresholdId]) {
                    Object.keys(weatherConditions).map(function (key) {
                        if (weatherConditions[key] == weatherId) {
                            schuhArray.push(schuh);
                        }
                    });
                }
            }
        });


    });
    return schuhArray;
}

function getSpezialArray(weatherId, spezialArray) {

    Object.keys(clothesDatabase.Spezialteile).map(function (key) {
        var spezial = clothesDatabase.Spezialteile[key];
        Object.keys(spezial.weatherConditions).map(function (key) {
            if (spezial.weatherConditions[key] == weatherId) {
                spezialArray.push(spezial);
            }
        });
    });
    return spezialArray;
}

function overview_template_controller_push(location, weatherDescription, currentTemperature, WEATHER_TYPE) {
    /* $('.currentWeather > .weatherIcon').html("<img src=" + imagesURLArray[WEATHER_TYPE] + ">"); */
    $('.weatherInformation').append('<p class="currentTemperature">' + currentTemperature + '°C' + '</p>')
        .append('<p class="location">' + location + ' - ' + weatherDescription + '</p>');

}

function suggestion_template_controller_push(oberteilArray, unterteilArray, schuhArray, spezialArray) {

    //function gets arrays from clothes for the current weather information

    var oberteilSuggestion = Object.keys(oberteilArray).map(function (key) {
        return oberteilArray[key].Name;
    });

    var unterteilSuggestion = Object.keys(unterteilArray).map(function (key) {
        return unterteilArray[key].Name;
    });

    var schuhSuggestion = Object.keys(schuhArray).map(function (key) {
        return schuhArray[key].Name;
    });

    var spezialSuggestion = Object.keys(spezialArray).map(function (key) {
        return spezialArray[key].Name;
    });

    $('.suggestiontext').append('<p> Heute solltest du dir ein ' + oberteilSuggestion + ' und eine ' + unterteilSuggestion + ' anziehen. Als Schuhwerk würde ich dir ' + schuhSuggestion + ' empfehlen. Außerdem solltest du vielleicht an eine ' + spezialSuggestion + ' denken. </p>');

    $('#oberteile').before('<p class="h5">Oberteil</p>');
    for (var i = 0; i < oberteilSuggestion.length; i++) {
        $('#oberteile').append('<li class="list-group-item">' + oberteilSuggestion[i] + '</li>');
    }

    $('#unterteile').before('<p class="h5">Unterteil</p>');
    for (var i = 0; i < unterteilSuggestion.length; i++) {
        $('#unterteile').append('<li class="list-group-item">' + unterteilSuggestion[i] + '</li>');
    }

    $('#schuhe').before('<p class="h5">Schuhwerk</p>');
    for (var i = 0; i < schuhSuggestion.length; i++) {
        $('#schuhe').append('<li class="list-group-item">' + schuhSuggestion[i] + '</li>');
    }

    $('#spezial').before('<p class="h5">Was du mitnehmen solltest</p>');
    for (var i = 0; i < spezialSuggestion.length; i++) {
        $('#spezial').append('<li class="list-group-item">' + spezialSuggestion[i] + '</li>');
    }
}

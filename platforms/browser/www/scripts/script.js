 document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log("navigator.geolocation works well");
    }
 

$(document).ready(function () {
    var clothesDatabase;
    var databaseConfiguration;
    var forecastData;
    getCurrentWeatherWithLocation(action.PUSH_TEMPLATE_OVERVIEW);
    getForecastWeatherWithLocation(action.PUSH_TEMPLATE_OVERVIEW);
    initializeDatabase();
    setTimeout(function () {
        determineClothesFromWeatherData();
    }, 5000);

});
 document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log("navigator.geolocation works well");
    }
 

$(document).ready(function () {
    var clothesDatabase;
    var databaseConfiguration;
    var forecastData;
    $('.site-wrap').toggleClass('disable-scroll');
    getCurrentWeatherWithLocation(action.PUSH_TEMPLATE_OVERVIEW);
    getForecastWeatherWithLocation(action.PUSH_TEMPLATE_OVERVIEW);
    initializeDatabase();
    colorHandler();
    setTimeout(function () {
        determineClothesFromWeatherData();
    }, 2000);
    
    

});
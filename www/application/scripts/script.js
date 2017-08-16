$(document).ready(function () {
    var clothesDatabase;
    var forecastData;
    getCurrentWeatherWithLocation(action.PUSH_TEMPLATE_OVERVIEW);
    getForecastWeatherWithLocation(action.PUSH_TEMPLATE_OVERVIEW);
    initializeDatabase();
    setTimeout(function () {
        determineClothesFromWeatherData();
    }, 2000);

});

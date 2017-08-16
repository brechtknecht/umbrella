function initializeDatabase() {
    $.getJSON("./server/database/clothesDatabase.json", function (data) {
        clothesDatabase = data;
    });

    $.getJSON("./server/database/databaseConfiguration.json", function (data) {
        databaseConfiguration = data;
    });
}

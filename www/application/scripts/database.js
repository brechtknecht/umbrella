function initializeDatabase(){
 $.getJSON( "../server/database/clothesDatabase.json", function( data ) {
  clothesDatabase = data;
});   
}
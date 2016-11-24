
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/demodb01');

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS demo (runtime REAL)");

    db.run("INSERT INTO demo (runtime) VALUES (?)", new Date().getTime());

    db.each("SELECT runtime FROM demo", function(err, row) {
        console.log("This app was run at " + row.runtime);
    });
});

db.close();
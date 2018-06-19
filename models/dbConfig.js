//DB configuration
var dbAllConfig = {

    config: {
        server: 'SERVER_NAME',
        database: 'YOUR_DB_NAME',
        user: 'YOUR_SQL_SERVER_USER_NAME',
        password: 'SQL_SERVER_PASSWORD'
    },    
    configPart2: {
        fName: 'Sonu',
        lName: 'Sharma'    
    },
    sayHello: function(name) {
        return 'Hello :: ' + name;
    }

}

module.exports = dbAllConfig;

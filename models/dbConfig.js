//DB configuration
var dbAllConfig = {

    config: {
        server: 'SONU',
        database: 'TutorialTest',
        user: 'sa',
        password: 'pat@111'
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
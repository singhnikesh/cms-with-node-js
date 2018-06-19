'use strict';
const sql = require('mssql');
const dbConfig = require('./dbConfig');

var login = {
    
    validateUser: function(data, callback){ 

        sql.connect(dbConfig.config, function(err){
            if (err)
                callback(err);

            // create Request object
            var request = new sql.Request();       
            //request.stream = true

            request.input('Username', sql.VarChar(250), data.Username);
            request.input('Password', sql.VarChar(250), data.Password);

            request.execute("usp_ValidateUser", function(err, recordset, retturnValue){
                if (err){
                    callback(err);
                }                    
                else{
                    //console.log(recordset);
                    callback(recordset[0]);
                }
            });        
            
        });

    }

}

module.exports = login;
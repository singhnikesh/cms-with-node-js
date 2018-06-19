'use strict';
const sql = require('mssql');
const dbConfig = require('./dbConfig');

var contact = {
    
    save: function(data, callback){ 

        sql.connect(dbConfig.config, function(err){
            if (err)
                callback(err);

            // create Request object
            var request = new sql.Request();       
            //request.stream = true

            request.input('Name', sql.VarChar(250), data.Name);
            request.input('Email', sql.VarChar(250), data.Email);
            request.input('Phone', sql.VarChar(50), data.Phone);
            request.input('Message', sql.VarChar(500), data.Message);
            request.input('IPAddress', sql.VarChar(50), data.IPAddress);

            request.execute("usp_InsertContactData", function(err, recordset, retturnValue){
                if (err){
                    callback(err);
                }                    
                else{
                    //console.log(recordset);
                    callback(recordset[0][0].Id);
                }
            });        
            
        });

    }

}

module.exports = contact;
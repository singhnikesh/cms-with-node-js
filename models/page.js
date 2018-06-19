'use strict';
const sql = require('mssql');
const dbConfig = require('./dbConfig');

var page = {
    
    getPageContentByURL: function(pageURL, callback){
        sql.connect(dbConfig.config, function (err) {   
                    
            if (err)
                callback(err);
           
            // create Request object
            var request = new sql.Request();           

            // query to the database and get the records
            var sqlQuery = "Select * From Page Where PageUrl = '" + pageURL + "' AND IsActive = 1 AND IsDelete = 0";

            request.query(sqlQuery, function (err, recordset) {            
           
                if (err)
                    callback(err);
                else
                    callback(recordset);
                          
            });

        });
    },

    getPageContentByURLProcedureMethod: function(pageURL, callback){

        sql.connect(dbConfig.config, function(err){
            if (err)
                callback(err);

            // create Request object
            var request = new sql.Request();       
            //request.stream = true

            request.input('PageUrl', sql.VarChar(250), pageURL);

            request.execute("usp_GetPageDetailsByPageUrl", function(err, recordset, retturnValue){
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

module.exports = page;
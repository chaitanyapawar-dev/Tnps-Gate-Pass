
var mysql = require('mysql');

const connection = mysql.createPool({ 
  host: '', 
    // host for connection 
    port: 3306, 
    // default port for mysql is 3306 
    database: '', 
    // database from which we want to connect out node application 
    user: '', 
    // username of the mysql connection 
    password: '' ,
    // password of the mysql connection 
    multipleStatements: true,
    connectionLimit:100000
});

connection.getConnection(function (err) {
    if(err){
        console.log(err);
    }
    else{
        console.log("connection created with Mysql successfully");
    }
 });

 module.exports = connection; 
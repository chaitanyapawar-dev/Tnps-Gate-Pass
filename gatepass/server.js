require('dotenv').config();
var mysql = require('mysql2');

const connection = mysql.createPool({ 
  host: process.env.DB_HOST || 'localhost', 
    // host for connection 
    port: 3306, 
    // default port for mysql is 3306 
    database: process.env.DB_NAME, 
    // database from which we want to connect out node application 
    user: process.env.DB_USER, 
    // username of the mysql connection 
    password: process.env.DB_PASSWORD,
    // password of the mysql connection 
    multipleStatements: true,
    connectionLimit: 100000,
    waitForConnections: true,
    queueLimit: 0
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
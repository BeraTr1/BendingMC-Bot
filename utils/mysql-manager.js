const mysql = require('mysql');

require('dotenv').config();

const MYSQL_CREDENTIALS = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

function createConnection() {
    return mysql.createConnection(MYSQL_CREDENTIALS);
}

function dbQuery(connection, query){
    // query = `USE ${MYSQL_CREDENTIALS.database}; ${query}`;
    // console.log("Database: " + MYSQL_CREDENTIALS.database);
    // let result;

    connection.query(query, (err, results) =>{
        // throw an error if query produces one
        if (err) console.log(" There was an error while executing query from database: " + err); //FIXME try and catch
        
        return results;
    });
}

function dbConnect(connection){
    connection.connect((err) => {
        // throw an error if connection produces one
        if (err) console.log("There was an error while connecting to the database: " + err); //FIXME try and catch
    });
}

exports.createTable = (tableName, tableColumns) =>{
    // create connection
    let connection = createConnection();

    // create table
    let query = `CREATE TABLE IF NOT EXISTS ${tableName} (${tableColumns});`;

    dbQuery(connection, query);

    connection.end();
}

exports.fetch = (id, table) => {
    let connection = createConnection();
    
    dbConnect(connection);

    let query = `SELECT * FROM ${table} WHERE Id="${id}";`;
    let results = dbQuery(connection, query);

    console.log("Fetch results: " + results); //DEBUG

    connection.end();

    return results;
}

exports.insert = (values, table, columns) => {
    let connection = createConnection();

    dbConnect(connection);

    let query = `INSERT INTO ${table} (${columns}) VALUES (${values});`;

    dbQuery(connection, query);

    connection.end();
}
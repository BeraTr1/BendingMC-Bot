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
    return new Promise( (resolve) => {
        connection.query(query, (err, result) =>{
            // throw an error if query produces one
            if (err) console.log(" There was an error while executing query from database: " + err); //FIXME try and catch
            // if (err)
                // reject(err);
            // result;
        
            // console.log("Inside query, results: " + result); //DEBUG
            resolve(result);
        });
    })
}

function dbConnect(connection){
    connection.connect((err) => {
        // throw an error if connection produces one
        if (err) console.log("There was an error while connecting to the database: " + err); //FIXME try and catch
    });
}

exports.createTable = (tableName, tableColumns) =>{
    return new Promise( (resolve) => {
        // create connection
        let connection = createConnection();

        // create table
        let query = `CREATE TABLE IF NOT EXISTS ${tableName} (${tableColumns});`;

        dbQuery(connection, query).then( ()=>{
            connection.end();
            resolve(); 
        });
    })
}

exports.fetch = (id, table) => {
    let connection = createConnection();
    
    dbConnect(connection);

    let query = `SELECT * FROM ${table} WHERE Id="${id}";`;

    return new Promise( (resolve) => {
        dbQuery(connection, query).then( (results) =>{
            resolve(results);
            connection.end();
        })
    });

    // return dbQuery(connection, query).then((results) => {
    //     // console.log("Length of data: " + result.length);
    //     connection.end();
    //     return results;
    // });
    // let results = await dbQuery(connection, query);
    // // let test = await test(); //DEBUG
    // // console.log("Testing" + test); //DEBUG
    // test().then((value) =>{
    //     console.log("Logging test: " + value);
    // })

    // console.log("Fetch results: " + results); //DEBUG
    // console.log("Fetch results.length: " + results.length); //DEBUG
    // console.log("Fetch results[0]: " + results[0]); //DEBUG


    // return results;
}

exports.insert = (values, table, columns) => {
    return new Promise( (resolve) => {
        let connection = createConnection();

        dbConnect(connection);

        let query = `INSERT INTO ${table} (${columns}) VALUES (${values});`;

        dbQuery(connection, query).then( () =>{
            connection.end();

            resolve();
        });
    })
}

exports.update = (table, column, value, id) => {
    let connection = createConnection();

    dbConnect(connection);

    let query = `UPDATE ${table} SET ${column}='${value}' WHERE Id='${id}'`;

    dbQuery(connection, query);
    
    connection.end();
}
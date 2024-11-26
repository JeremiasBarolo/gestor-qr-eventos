const mysql = require("mysql2");
require('dotenv').config();

let dbConfig = {
    connectionLimit: 90, // default 10
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '3306',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '83328332',
    database: process.env.DB_NAME || 'gestor_qr_eventos',
};

const pool = mysql.createPool(dbConfig);
const connection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);

      const query = (sql, binding) => {
        return new Promise((resolve, reject) => {
          connection.query(sql, binding, (err, result) => {
            if (err) {
              connection.release();
              return reject(err);
            }
            console.log("MySQL pool connected ✔");
            connection.release();
           
            resolve(result);
            console.log("MySQL pool released ❌");
          });
        });
      };

      const release = () => {
        connection.release();
        console.log("MySQL pool released ❌");
      };

      resolve({ query, release });
    });
  });
};

const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};
module.exports = { pool, connection, query };
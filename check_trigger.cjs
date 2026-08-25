const mysql = require('mysql2');
const connection = mysql.createConnection({host: 'localhost', user: 'root', password: '012140268Pp', database: 'fitlife_db'});
connection.query('SHOW TRIGGERS;', (err, res) => {
  console.log(err || res);
  connection.end();
});

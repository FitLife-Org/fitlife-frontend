const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '012140268Pp',
  database: 'fitlife_db'
});

connection.query(
  'SELECT id, username, status, is_deleted FROM users ORDER BY id DESC LIMIT 5;',
  function(err, results, fields) {
    console.log("USERS:");
    console.log(err || results);
    
    connection.query(
      'SELECT id, member_code, status, is_deleted, user_id FROM members ORDER BY id DESC LIMIT 5;',
      function(err, results, fields) {
        console.log("MEMBERS:");
        console.log(err || results);
        connection.end();
      }
    );
  }
);

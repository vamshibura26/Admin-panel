const mysql = require('mysql');

exports.start = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'',
  database:'Admin'

});
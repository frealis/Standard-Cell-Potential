const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  // connectionString: 'postgres://cdoeymfxwzrlil:f27c39881e1ccce41763fee20b1bac54eb1d674d9cbcb63da79e6922ef3a6135@ec2-23-23-216-40.compute-1.amazonaws.com:5432/d3v5ah20dp9gqv',
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

  .get('/', (req, res) => res.render('pages/index'))
  .get('/test', (req, res) => res.render('pages/test'))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM periodic_table');
      res.render('pages/db', {
        title: 'Database Results',
        result: result
      });
      client.release();
    } 
    catch (err) {console.error(err); res.send("Error " + err);}
  })

  .post('/', urlencodedParser, function (req, res) {
    res.send('welcome, ' + req.body.input_1)
  })

  // .post('/test', urlencodedParser, function (req, res) {
  //   res.send('welcome, ' + req.body.input_a)
  // })

  .post('/test', urlencodedParser, async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM periodic_table WHERE atomicnumber=' + req.body.input_a);
      // console.log(req.body.input_a);
      console.log(result.rows[0]);
      console.log(result.rows[0].atomicnumber);
      res.render('pages/test', {result: result.rows[0].atomicnumber});
      // res.send('output: ' + result.rows[0].atomicnumber);
      client.release();
    } 
    catch (err) {console.error(err); res.send("Error " + err);}
  })

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
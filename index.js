const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

  .get('/', (req, res) => res.render('pages/index', {
    result_en_a: '',
    result_an_a: '',
    result_sep_a: '',
    result_en_b: '',
    result_an_b: '',
    result_sep_b: ''
  }))
  .get('/test', async (req, res) => {
    try {
      const client = await pool.connect()
      const x = await client.query('SELECT * FROM periodic_table');
      res.render('pages/test', {
        result_en_x: '',
        result_an_x: '',
        result_sep_x: '',
        result_en_y: '',
        result_an_y: '',
        result_sep_y: '',
        element: x.rows
      });
      console.log(x.rows);
      client.release();
    } 
    catch (err) {console.error(err); res.send("Error " + err);}
  })
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

  .post('/', urlencodedParser, async (req, res) => {
    try {
      const client = await pool.connect()
      const result_a = await client.query('SELECT * FROM periodic_table WHERE atomicnumber=' + req.body.input_a);
      const result_b = await client.query('SELECT * FROM periodic_table WHERE atomicnumber=' + req.body.input_b);
      res.render('pages/index', {
        result_en_a: result_a.rows[0].elementname,
        result_an_a: result_a.rows[0].atomicnumber,
        result_sep_a: result_a.rows[0].sep,
        result_en_b: result_b.rows[0].elementname,
        result_an_b: result_b.rows[0].atomicnumber,
        result_sep_b: result_b.rows[0].sep
      });
      client.release();
    } 
    catch (err) {console.error(err); res.send("Error " + err);}
  })
  .post('/test', urlencodedParser, async (req, res) => {
    try {
      const client = await pool.connect()
      const result_x = await client.query(`SELECT * FROM periodic_table WHERE elementname='${req.body.input_x}'`);
      const result_y = await client.query(`SELECT * FROM periodic_table WHERE elementname='${req.body.input_y}'`);
      const x = await client.query('SELECT * FROM periodic_table');
      res.render('pages/test', {
        result_en_x: result_x.rows[0].elementname,
        result_an_x: result_x.rows[0].atomicnumber,
        result_sep_x: result_x.rows[0].sep,
        result_en_y: result_y.rows[0].elementname,
        result_an_y: result_y.rows[0].atomicnumber,
        result_sep_y: result_y.rows[0].sep,
        element: x.rows
      });
      client.release();
    } 
    catch (err) {console.error(err); res.send("Error " + err);}
  })

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
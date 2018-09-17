const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false })

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

  .get('/', async (req, res) => {
    try {
      const client = await pool.connect();
      const elemOptions = await client.query('SELECT * FROM periodic_table');
      res.render('pages/', {
        elemName_A:     '',
        atomNum_A:      '',
        stndElecPot_A:  '',
        elemName_B:     '',
        atomNum_B:      '',
        stndElecPot_B:  '',
        elemOptions:    elemOptions.rows,
        ecell:          ''
      });
      client.release();
    } 
    catch (err) {console.error(err); res.send("Error " + err);}
  })
  .get('/test', async (req, res) => {
    try {
      const client = await pool.connect();
      const elemOptions = await client.query('SELECT * FROM periodic_table');
      res.render('pages/test', {
        elemName_X:     '',
        atomNum_X:      '',
        stndElecPot_X:  '',
        elemName_Y:     '',
        atomNum_Y:      '',
        stndElecPot_Y:  '',
        elemOptions:    elemOptions.rows,
        ecell:          ''
      });
      client.release();
    } 
    catch (err) {console.error(err); res.send("Error " + err);}
  })

  .post('/', urlencodedParser, async (req, res) => {
    try {
      const client = await pool.connect();
      const cell_A = await client.query(`SELECT * FROM periodic_table WHERE elementname='${req.body.input_a}'`);
      const cell_B = await client.query(`SELECT * FROM periodic_table WHERE elementname='${req.body.input_b}'`);
      const elemOptions = await client.query('SELECT * FROM periodic_table');
      var ecell = Math.abs(parseFloat(cell_A.rows[0].sep) - parseFloat(cell_B.rows[0].sep))
      res.render('pages/', {
        elemName_A:     cell_A.rows[0].elementname,
        atomNum_A:      cell_A.rows[0].atomicnumber,
        stndElecPot_A:  cell_A.rows[0].sep,
        elemName_B:     cell_B.rows[0].elementname,
        atomNum_B:      cell_B.rows[0].atomicnumber,
        stndElecPot_B:  cell_B.rows[0].sep,
        elemOptions:    elemOptions.rows,
        ecell:          ecell
      });
      client.release();
    } 
    catch (err) {console.error(err); res.send("Error " + err);}
  })
  .post('/test', urlencodedParser, async (req, res) => {
    try {
      const client = await pool.connect();
      const cell_X = await client.query(`SELECT * FROM periodic_table WHERE elementname='${req.body.input_x}'`);
      const cell_Y = await client.query(`SELECT * FROM periodic_table WHERE elementname='${req.body.input_y}'`);
      const elemOptions = await client.query('SELECT * FROM periodic_table');
      let ecell = Math.abs(parseFloat(cell_X.rows[0].sep) - parseFloat(cell_Y.rows[0].sep));
      let posTerminal = parseFloat(cell_X.rows[0].sep) > parseFloat(cell_Y.rows[0].sep) ? cell_X.rows[0].elementname : cell_Y.rows[0].elementname;
      let negTerminal = parseFloat(cell_X.rows[0].sep) < parseFloat(cell_Y.rows[0].sep) ? cell_X.rows[0].elementname : cell_Y.rows[0].elementname;
      res.render('pages/test', {
        cell_X:         cell_X.rows,
        cell_Y:         cell_Y.rows,
        elemOptions:    elemOptions.rows,
        ecell:          ecell,
        posTerminal:    posTerminal,
        negTerminal:    negTerminal
      });
      client.release();
    }
    catch (err) {console.error(err); res.send("Error " + err);}
  })

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

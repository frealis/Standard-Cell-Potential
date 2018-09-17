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

  // TEST
  .get('/test', async (req, res) => {
    try {
      const client = await pool.connect();
      const elemOptions = await client.query('SELECT * FROM periodic_table');
      res.render('pages/test', {
        cell_X:         '',
        cell_Y:         '',
        elemOptions:    elemOptions.rows,
        ecell:          '',
        posTerminal:    '',
        negTerminal:    ''
      });
      client.release();
    } 
    catch (err) {console.error(err); res.send("Error " + err);}
  })

  // TEST
  .post('/test', urlencodedParser, async (req, res) => {
    try {
      const client = await pool.connect();
      const elemOptions = await client.query('SELECT * FROM periodic_table');
      
      // creating cell_X using a self-invoking function
      // https://www.w3schools.com/js/js_function_definition.asp
      let cell_X = (function () {
        for (let i = 0; i < elemOptions.rows.length; i++) {
          if (elemOptions.rows[i].elementname === req.body.input_x) {
            console.log(elemOptions.rows[i]);
            return elemOptions.rows[i];
          };
        };
      })();

      // creating cell_Y using a self-invoking function
      let cell_Y = (function () {
        for (let i = 0; i < elemOptions.rows.length; i++) {
          if (elemOptions.rows[i].elementname === req.body.input_y) {
            console.log(elemOptions.rows[i]);
            return elemOptions.rows[i];
          };
        };
      })();
      
      // calculations
      let ecell = Math.abs(parseFloat(cell_X.sep) - parseFloat(cell_Y.sep));
      let posTerminal = parseFloat(cell_X.sep) > parseFloat(cell_Y.sep) ? cell_X.elementname : cell_Y.elementname;
      let negTerminal = parseFloat(cell_X.sep) < parseFloat(cell_Y.sep) ? cell_X.elementname : cell_Y.elementname;
      
      // render the reponse from the POST method
      res.render('pages/test', {
        cell_X:         cell_X,
        cell_Y:         cell_Y,
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

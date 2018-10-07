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

  .post('/', urlencodedParser, async (req, res) => {
    try {
      const client = await pool.connect();
      const elemOptions = await client.query('SELECT * FROM periodic_table');
      
      // create cell_X using a self-invoking function
      let cell_X = (function () {
        for (let i = 0; i < elemOptions.rows.length; i++) {
          if (elemOptions.rows[i].elementname === req.body.input_x) {
            return elemOptions.rows[i];
          };
        };
      })();

      // create cell_Y using a self-invoking function
      let cell_Y = (function () {
        for (let i = 0; i < elemOptions.rows.length; i++) {
          if (elemOptions.rows[i].elementname === req.body.input_y) {
            return elemOptions.rows[i];
          };
        };
      })();

      // calculations
      let ecell = Math.abs(parseFloat(cell_X.sep) - parseFloat(cell_Y.sep));
      let posTerminal = parseFloat(cell_X.sep) > parseFloat(cell_Y.sep) ? cell_X.elementname : cell_Y.elementname;
      let negTerminal = parseFloat(cell_X.sep) < parseFloat(cell_Y.sep) ? cell_X.elementname : cell_Y.elementname;

      // render the reponse from the POST method
      res.render('pages/', {
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

  // TEST
  .get('/test', async (req, res) => {
    try {
      const client = await pool.connect();
      const elemOptions = await client.query('SELECT * FROM periodic_table ORDER BY atomicnumber');
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

      // this query returns a bunch of arrays[], called rows[], that contain 
      // objects{} with elementname, atomicnumber, and sep 
      const elemOptions = await client.query('SELECT * FROM periodic_table ORDER BY atomicnumber');
      
      // create cell_X using a self-invoking function
      // https://www.w3schools.com/js/js_function_definition.asp
      let cell_X = (function () {
        for (let i = 0; i < elemOptions.rows.length; i++) {
          if (elemOptions.rows[i].elementname === req.body.input_x) {
            return elemOptions.rows[i];
          };
        };
      })();

      // create cell_Y using a self-invoking function
      let cell_Y = (function () {
        for (let i = 0; i < elemOptions.rows.length; i++) {
          if (elemOptions.rows[i].elementname === req.body.input_y) {
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

  .get('/about', async (req, res) => {
    res.render('pages/about');
  })

  .get('/resources', async (req, res) => {
    res.render('pages/resources');
  })

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

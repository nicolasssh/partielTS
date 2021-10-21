const express = require( 'express' )
const Mustache = require('Mustache')
const axios = require('axios')
const path = require('path')
const {createConnection, createConnections, Connection, getConnection}  =  require("typeorm")
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const mustacheExpress = require('mustache-express')
const { send } = require('express/lib/response')
const serve   = require('express-static')

let port = 3000

const app = express()

app.use(bodyParser.json())
app.use( bodyParser.urlencoded( { extended: true } ) )

const connect = async () =>
{
   try
  {
    const connection = await createConnection({
      type: "mysql",
      host: "localhost",
      port: 8889,
      username: "root",
      password: "root",
      database: "partielTS"
    })
    //console.log('Connexion effectuée.')
  } catch ( e )
  {
    console.log(e)
  }
}

connect()

app.use(fileUpload({
    createParentPath : true,
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles : true,
    tempFileDir : '/tmp/'
}))

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set( 'views', __dirname + '/views' );
app.use(express.static(path.join(__dirname)));

app.get('/', async (req, res, next) => {
    const connection = await getConnection()
    connection.query(`SELECT * FROM pictures`, function (error, results, fields) {
        console.log(results)
        if (error) {
            return res.status(500, 'Erreur lors de la connexion à la base de données.')
        }
        results = results.map((ult) => {return { picture : ult.picture , descr : ult.descr , title : ult.title }})
        res.render('home', { results: results })
    })
})

app.post('/', async (req, res, next) => {
    req.files.picture.mv( `./picture/${req.files.picture.name}`, ( err ) =>
    {
        if (err) {
            return res.status(500).send(err);
        }

        res.send('Fichier upload');
    })
    const connection = await getConnection()
    connection.query(`INSERT INTO pictures (picture, title, descr) VALUES ('./picture/${req.files.picture.name}', '${req.body.title}', '${req.body.desc}')`, function (error, results, fields) {
        if (error) {
            console.log(error)
        } else {
            console.log('Fichier upload dans la base de données.')
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
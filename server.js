const express = require('express')
const app = express()
const WebSocket = require('ws')
const bodyparser = require('body-parser')
const sqlite3 = require('sqlite3').verbose();
const sha256 = require('sha256')
const session = require('express-session')
const pty = require('node-pty');
// port de l'application
const port = 9000
const viewspath = "/usr/local/WebTerm/views/"
const publicpath = "/usr/local/WebTerm/public"
const DBfile = "db.sqlite"

function LoggingBrowse(req) {
    var date = new Date()
    console.log("{ date: "+date.toLocaleString('fr-FR', { timeZone: 'Europe/Paris'})+", method: "+ req.method+", path: "+req.path+"}")
}


// Accès DB
var db = new sqlite3.Database(DBfile, function (err) {
    if(err)
    {
        console.log(err.message)
    }
    else {
        console.log("connecté à la base de donnée")
        db.run('CREATE TABLE utilisateur (idutilistateur INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)', function (err) {
            if (err) {
                console.log(err.message)
            }
            else {
                var insert = 'INSERT INTO utilisateur (username, password) VALUES (?,?)'
                db.run(insert, ["administrateur","b49a047d259bce776b9e0e584a178cb6b5ef3bef51c54bc0c74cd6e69ad2481e"])
            }
        })
    }
})


const wss = new WebSocket.Server({
    port: 9001
})
const os = require('os');



wss.on('connection', function(client){
    // Detection platforme
    var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

    //pseudo tty
    var ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 160,
        rows: 40,
        cwd: process.env.HOME,
        env: process.env
    });
    // lorsque le shell renvoi un résultat, il est renvoyé au client.
    ptyProcess.on('data', function(data) {
        client.send(data)
    })
    // lorsqu'on reçoit une commande de l'utilisateur on l'envoi au shell
    client.on('message', function(message) {
        ptyProcess.write(message)
    })
})


// Chargement des fichiers static
app.use(express.static(publicpath));

// Middleware
app.set('view engine','ejs')
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())
app.use(session({
    secret: "ojmgshfgbmgqhrglqirgdovbrigzgroqrfqsr2665r5g+r6w5",
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}))

// on sert la page d'index
app.get('/', function (req, res) {
    if(!req.session.user)
    {
        LoggingBrowse(req)
        res.redirect("/connexion")
    }
    else
    {
        res.render(viewspath+"index")
    }
  })

app.get('/connexion', function (req, res) {
    LoggingBrowse(req)
    res.render(viewspath+"connexion")
})

app.post('/connexion', function (req,res) {
    LoggingBrowse(req)
    var sql = "SELECT * FROM utilisateur WHERE username = ?"
    db.get(sql, req.body.Username, function (err, row) {
        if(err) {
            console.log(err.message)
        }
        else if(row == null) {
            res.render(viewspath+"connexion", {error: "Nom d'utilisateur ou mot de passe incorrect !"})
        }
        else {
            if(sha256(req.body.Password) == row.password)
            {
                console.log("Connexion réussi en tant que "+req.body.Username)
                req.session.user = req.body.Username
                res.redirect('/')
            } 
            else
            {
                console.log("Echec de l'authentification pour "+req.body.Username)
                res.render(viewspath+"connexion", {error: "Nom d'utilisateur ou mot de passe incorrect !"})
            }
        }
    })
    
})


app.listen(port, function () {
    console.log('Application lancé sur le port '+port)
})
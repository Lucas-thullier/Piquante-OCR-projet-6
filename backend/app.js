/* Déclaration différents élements composant l'application */
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs'); // gestion des fichiers
const bodyParser = require('body-parser'); // parsing du body des requete
const path = require('path'); // pour images
const mongoSanitize = require('mongo-express-sanitize'); // supprime dans req tout ce qui commence par $ (évite les injection NoSql)

const app = express();

/* On initialise les routes */
const userRoutes = require('./routes/UserRoute');
const sauceRoutes = require('./routes/SauceRoute');

/* Récupération des identifiants pour la base de données */
const credentials = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'));
const bddUser = credentials.user;
const bddPassword = credentials.password;
const dbName = credentials.dbName;

/* Construction de la string de connexion à la BDD */
let bddConnectString = credentials.bddConnectString;
bddConnectString = bddConnectString.replace('<user>', bddUser);
bddConnectString = bddConnectString.replace('<password>', bddPassword);
bddConnectString = bddConnectString.replace('<dbname>', dbName);

/* Connexion à la base de données */
mongoose.connect(bddConnectString, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));


/* Définit les types de requetes possibles et l'origine autorisée de ces dernières */
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

/* Pour parser le corps des requetes */
app.use(bodyParser.json());
app.use(mongoSanitize.default()); //TODO voir avec Williams : dans docu ils font app.use(mongoSanitize()); mais ça me met une erreur is not a function donc j'ai mis .default() je sais pas vraiment comment vérifier si cela fonctionne

app.use('/images', express.static(path.join(__dirname, 'images'))); // pour les images

/* Routes de l'API */
app.use('/api/auth/', userRoutes);
app.use('/api/', sauceRoutes);

module.exports = app;
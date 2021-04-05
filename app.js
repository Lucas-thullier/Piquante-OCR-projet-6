/* Déclaration différents élements composant l'application */
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // parsing du body des requete
const path = require("path"); // pour images
const mongoSanitize = require("mongo-express-sanitize"); // supprime dans req tout ce qui commence par $ (évite les injection NoSql)
const winston = require("winston");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "./logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "./logs/combined.log" }),
  ],
});

app.use(helmet());

/* On initialise les routes */
const userRoutes = require("./routes/UserRoute");
const sauceRoutes = require("./routes/SauceRoute");

/* Récupération des identifiants pour la base de données */
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

/* Construction de la string de connexion à la BDD */
let bddConnectString = `mongodb+srv://${dbUser}:${dbPassword}@clusterpiquante.pl1qq.mongodb.net/${dbName}?retryWrites=true&w=majority`;

/* Connexion à la base de données */
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose
  .connect(bddConnectString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

/* Définit les types de requetes possibles et l'origine autorisée de ces dernières */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

/* Pour parser le corps des requetes */
app.use(bodyParser.json());
app.use(mongoSanitize.default());
app.use("/images", express.static(path.join(__dirname, "images")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});

/* Routes de l'API */
app.use("/api/auth/", limiter, userRoutes);
app.use("/api/", sauceRoutes);

module.exports = app;

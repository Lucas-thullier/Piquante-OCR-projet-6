const User = require("../models/User");
const bcrypt = require("bcrypt"); // pour hash le mot de passe
const jsonWebToken = require("jsonwebtoken"); // fournit un token pour la session au moment du login
const validator = require("validator"); // vérifie si bien une adresse mail renseignée à la création + si sécurité du mdp est forte

exports.signup = (req, res, next) => {
  logger.info("Creation d'un nouvel utilisateur...");
  if (!validator.isStrongPassword(req.body.password)) {
    logger.error("Le mot de passe n'est pas assez sécurisé");
    throw "Le mot de passe doit contenir: une lettre minuscule, une lettre majuscule, un chiffre, " + "un caractère spécial et doit faire plus de 8 caractères.";
  }
  if (!validator.isEmail(req.body.email)) {
    logger.error("L'adresse mail n'est pas valide");
    throw "L'adresse mail renseignée n'est pas valide.";
  }
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const newUser = new User({
        email: req.body.email,
        password: hash,
      });
      newUser
        .save()
        .then(() => {
          logger.info("Creation du nouvel utilisateur OK");
          res.status(201).json({ message: "Utilisateur créé !" });
        })
        .catch((error) => {
          logger.info("Echec de la creation du nouvel utilisateur");
          logger.info(error);
          res.status(400).json({ error });
        });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  logger.info("Connexion d'un utilisateur...");
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        logger.info("Utilisateur non trouvé");
        return res.statut(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            logger.info("Le mot de passe est incorrect");
            return res.statut(401).json({ error: "Mot de passe incorrect !" });
          }
          logger.info("Connexion OK. Envoi de la réponse au client");
          res.status(200).json({
            userId: user._id,
            token: jsonWebToken.sign(
              { userId: user._id },
              "RANDOM_TOKEN_SECRET", // voir avec Williams voir si génération aléatoire d'une string systématique ou une seule string appliquée à chaque fois
              { expiresIn: "24h" }
            ),
          });
        })
        .catch((error) => {
          logger.info("Erreur durant la vérification du mot de passe");
          res.status(500).json({ error });
        });
    })
    .catch((error) => {
      logger.error(error);
      res.status(500).json({ error });
    });
};

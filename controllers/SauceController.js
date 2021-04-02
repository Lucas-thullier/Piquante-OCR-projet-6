const sauceModel = require("../models/Sauce");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

/* GET */
exports.getAllSauces = (req, res, next) => {
  logger.info("Recuperation de toutes les sauces...");
  sauceModel
    .find()
    .then((sauces) => {
      logger.info("Recuperation de toutes les sauces OK ! Envoi de la reponse");
      res.status(200).json(sauces);
    })

    .catch((error) => {
      logger.info("Erreur de recuperation de toutes les sauces");
      logger.error(error);
      res.status(400).json({ error });
    });
};

exports.getOneSauce = (req, res, next) => {
  logger.info(`Recuperation d'une sauce par l'id: ${req.params.id} ...`);
  sauceModel
    .findOne({ _id: req.params.id })
    .then((sauce) => {
      logger.info("Sauce OK ! Envoi de la reponse au client");
      res.status(200).json(sauce);
    })
    .catch((error) => {
      logger.info("Erreur de recuperation d'une sauce par l'id");
      logger.error(error);
      res.status(400).json({ error });
    });
};
/* FIN GET */

/* POST */
/* QUAND ERREUR DE CRÉATION L'IMAGE EST QUAND MEME AJOUTÉE */
exports.createOneSauce = (req, res, next) => {
  logger.info(`Création d'une sauce ... à partir de ${req.body.sauce}`);
  const parsedBodySauce = JSON.parse(req.body.sauce);
  delete parsedBodySauce._id;
  const sauce = new sauceModel({
    ...parsedBodySauce,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });
  sauce
    .save()
    .then(() => {
      logger.info("Création réussie ! Envoi de la réponse au client");
      res.status(201).json({ message: "Sauce créée !" });
    })
    .catch((error) => {
      logger.info("Échec de la création");
      logger.info(error);
      res.status(400).json({ error });
    });
};

exports.defineLike = (req, res, next) => {
  logger.info(`Modification du like/dislike...`);
  const likeValue = req.body.like;
  const userId = req.body.userId;
  const sauceId = req.params.id;
  sauceModel
    .findOne({ _id: sauceId })
    .then((sauce) => {
      if (sauce.usersLiked.indexOf(userId) == -1 && sauce.usersDisliked.indexOf(userId) == -1) {
        // si actuellement aucun like ou dislike
        if (likeValue == -1) {
          sauce.usersDisliked.push(userId);
          sauce.Dislikes++;
        } else if (likeValue == 1) {
          sauce.usersLiked.push(userId);
          sauce.likes++;
        }
      } else if (sauce.usersLiked.indexOf(userId) != -1 && sauce.usersDisliked.indexOf(userId) == -1) {
        // si actuellement dislike
        if (likeValue == 0) {
          const index = sauce.usersDisliked.indexOf(userId);
          sauce.usersDisliked.splice(index, userId);
          sauce.Dislikes--;
        }
      } else if (sauce.usersLiked.indexOf(userId) == -1 && sauce.usersDisliked.indexOf(userId) != -1) {
        // si actuellement like
        if (likeValue == 0) {
          const index = sauce.usersLiked.indexOf(userId);
          sauce.usersLiked.splice(index, userId);
          sauce.likes--;
        }
      }
      sauce.save();
      logger.info("Modification de like/dislike OK !");
      res.status(200).json({ message: "Sauce modifiée !" });
    })
    .catch((error) => {
      logger.info("Echec de la modification du like/dislike");
      logger.error(error);
      res.status(400).json({ error });
    });
};
/* FIN POST */

/* PUT */
exports.modifySauce = (req, res, next) => {
  logger.info("Modification d'une sauce ...");
  let sauce;
  if (req.file) {
    sauce = {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    };
  } else {
    sauce = { ...req.body };
  }
  sauceModel
    .findOneAndUpdate({ _id: req.params.id }, { ...sauce, _id: req.params.id })
    .then((oldSauce) => {
      if (sauce.imageUrl && sauce.imageUrl != oldSauce.imageUrl) {
        const pathToOldFile = oldSauce.imageUrl.replace(/.+images\//, `${process.cwd()}/images/`);
        fs.unlinkSync(pathToOldFile);
      }
      logger.info("Modification d'une sauce OK");
      res.status(200).json({ message: "Sauce modifiée !" });
    })
    .catch((error) => {
      logger.info("Echec de la modification d'une sauce");
      logger.info(error);
      res.status(400).json({ error });
    });
};
/* FIN PUT */

/* DELETE */
exports.deleteSauce = (req, res, next) => {
  logger.info("Suppression d'une sauce...");
  sauceModel
    .findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        sauceModel
          .deleteOne({ _id: req.params.id })
          .then(() => {
            logger.info("Suppression d'une sauce OK");
            res.status(200).json({ message: "Sauce supprimée !" });
          })
          .catch((error) => {
            logger.info("Echec de la suppresion d'une sauce");
            logger.info(error);
            res.status(400).json({ error });
          });
      });
    })
    .catch((error) => {
      logger.info("Erreur durant la selection de la sauce à supprimer");
      logger.info(error);
      res.status(500).json({ error });
    });
};
/* FIN DELETE */

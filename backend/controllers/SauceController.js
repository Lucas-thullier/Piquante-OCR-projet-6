const sauceModel = require('../models/Sauce');
const User = require('../models/User');
const fs = require('fs');

/* GET */
exports.getAllSauces = (req, res, next) => {
    sauceModel.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    sauceModel.findOne({ _id:req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({ error }));
};
/* FIN GET */


/* POST */
/* QUAND ERREUR DE CRÉATION L'IMAGE EST QUAND MEME AJOUTÉE */
exports.createOneSauce = (req, res, next) => {
    const parsedBodySauce = JSON.parse(req.body.sauce);
    delete parsedBodySauce._id;
    const sauce = new sauceModel({
      ...parsedBodySauce,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce créée !'}))
    .catch(error => res.status(400).json({ error }));
};

/* TODO voir avec Williams si + judicieux de distinguer une route post pour premier like/dislike d'une route put quand l'un de ces derniers déjà présent */
exports.defineLike = (req, res, next) => {
    const likeValue = req.body.like;
    const userId =  req.body.userId;
    const sauceId = req.params.id;
    sauceModel.findOne({ _id:sauceId })
    .then(sauce => {
        if (sauce.usersLiked.indexOf(userId) == -1 && sauce.usersDisliked.indexOf(userId) == -1) { // si actuellement aucun like ou dislike
            if (likeValue == -1) {
                sauce.usersDisliked.push(userId);
                sauce.Dislikes++;
            } else if (likeValue == 1) {
                sauce.usersLiked.push(userId);
                sauce.likes++;
            }
        } else if (sauce.usersLiked.indexOf(userId) != -1 && sauce.usersDisliked.indexOf(userId) == -1) { // si actuellement dislike
            if (likeValue == 0) {
                const index = sauce.usersDisliked.indexOf(userId);
                sauce.usersDisliked.splice(index, userId);
                sauce.Dislikes--;
            }
        } else if (sauce.usersLiked.indexOf(userId) == -1 && sauce.usersDisliked.indexOf(userId) != -1) { // si actuellement like
            if (likeValue == 0) {
                const index = sauce.usersLiked.indexOf(userId);
                sauce.usersLiked.splice(index, userId);
                sauce.likes--;
            }
        }
        sauce.save();
        res.status(200).json({ message: 'Sauce modifiée !'})
    })
    .catch(error => res.status(400).json({ error }));
};
/* FIN POST */


/* PUT */
exports.modifySauce = (req, res, next) => {
    const sauce = req.file ? //si req file.file existe partie avant ":" sinon partie après (ternaire basique)
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    sauceModel.updateOne({ _id: req.params.id }, { ...sauce, _id: req.params.id })
    /* TODO Faire en sorte de supprimer l'image associée quand modif (actuellement elle reste dans backend/images) */
    .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
    .catch(error => res.status(400).json({ error }));
};
/* FIN PUT */


/* DELETE */
exports.deleteSauce = (req, res, next) => {
    sauceModel.findOne({ _id: req.params.id })
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            sauceModel.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
            .catch(error => res.status(400).json({ error }));
        });
    })
    .catch(error => res.status(500).json({ error }));
};
/* FIN DELETE */

const User = require('../models/User');
const bcrypt = require('bcrypt'); // pour hash le mot de passe
const jsonWebToken = require('jsonwebtoken'); // fournit un token pour la session au moment du login
const validator = require('validator'); // vérifie si bien une adresse mail renseignée à la création + si sécurité du mdp est forte

exports.signup = (req, res, next) => {
    console.log(validator.isStrongPassword(req.body.password));
    if (!validator.isStrongPassword(req.body.password)) { // TODO voir avec Williams si moyen d'afficher l'erreur dans le front + si bonne façon de relever l'erreur
        throw 'Le mot de passe doit contenir: une lettre minuscule, une lettre majuscule, un chiffre, '
            + 'un caractère spécial et doit faire plus de 8 caractères.';
    }
    if (!validator.isEmail(req.body.email)) {
        throw 'L\'adresse mail renseignée n\'est pas valide.';
    }
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const newUser = new User({
            email: req.body.email,
            password: hash
        })
        newUser.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email:req.body.email })
    .then(user => {
        if (!user) {
            return res.statut(401).json({error: 'Utilisateur non trouvé !'});
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (!valid) {
                return res.statut(401).json({error: 'Mot de passe incorrect !'});
            }
            res.status(200).json({
                userId: user._id,
                token: jsonWebToken.sign(
                    { userId: user._id },
                    'RANDOM_TOKEN_SECRET', // voir avec Williams voir si génération aléatoire d'une string systématique ou une seule string appliquée à chaque fois
                    { expiresIn: '24h' }
                )
            });
        })
        .catch(error => res.status(500).json({ error }))
    })
    .catch(error => res.status(500).json({ error }));
};
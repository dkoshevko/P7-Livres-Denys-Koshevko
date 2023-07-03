const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// Fonction pour créer un nouvel utilisateur
exports.signup = (req, res, next) => {

    // Hasher le mot de passe avec bcrypt
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });

            // Enregistrer l'utilisateur dans la base de données
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// Fonction pour connecter un utilisateur existant
exports.login = (req, res, next) => {

    // Rechercher l'utilisateur dans la base de données par son email
    User.findOne({ email: req.body.email })
        .then(user => {
            // Vérifier si l'utilisateur existe
            if (user === null) {
                res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
            } else {
                // Comparer le mot de passe fourni avec le mot de passe stocké
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        // Vérifier si le mot de passe est valide
                        if (!valid) {
                            res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
                        } else {
                            // Créer un token JWT contenant l'identifiant de l'utilisateur
                            const token = jwt.sign(
                                { userId: user._id },
                                process.env.JWT_SECRET, // Utiliser la clé secrète définie dans les variables d'environnement
                                { expiresIn: '24h' }
                            );

                            res.status(200).json({
                                userId: user._id,
                                token: token
                            });
                        }
                    })
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
};
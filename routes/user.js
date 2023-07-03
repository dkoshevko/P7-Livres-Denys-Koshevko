// Import des modules
const express = require('express');
const router = express.Router();

// Import du controlleur
const userCtrl = require('../controllers/user');

// Route pour l'inscription d'un utilisateur
router.post('/signup', userCtrl.signup);

// Route pour la connexion d'un utilisateur
router.post('/login', userCtrl.login);


module.exports = router;
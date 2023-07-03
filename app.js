// Importer le module 'express'
const express = require('express');

// Importer le module 'body-parser' pour analyser les corps des requêtes
const bodyParser = require('body-parser');

// Importer le module 'mongoose' pour la connexion à MongoDB
const mongoose = require('mongoose');

// Importer le module 'path' pour gérer les chemins de fichiers
const path = require('path');

// Utiliser dotenv pour charger les variables d'environnement
require('dotenv').config();

// Importer les routes:
const booksRoutes = require('./routes/books'); // Livres
const userRoutes = require('./routes/user'); // Utilisateurs

// Créer une instance d'application Express
const app = express();

// Se connecter à MongoDB
mongoose.connect(process.env.MONGODB_URI, 
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true 
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));
    
// Middleware pour analyser le corps des requêtes en JSON
app.use(express.json());

// Middleware pour gérer les en-têtes CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    next();
});

// Middleware body-parser pour analyser les corps des requêtes en JSON
app.use(bodyParser.json());

// Utiliser les routes:
app.use('/api/books', booksRoutes); // Livres
app.use('/api/auth', userRoutes); // Utilisateurs

// Servir les fichiers statiques du dossier 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app; // Exporter l'application Express
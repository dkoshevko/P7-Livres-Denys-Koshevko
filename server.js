const http = require('http');
const app = require('./app');

// Fonction pour normaliser le port, renvoie le port valide ou false s'il est invalide
const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
};

// Récupérer le numéro de port à partir des variables d'environnement ou utiliser le port 4000 par défaut
const port = normalizePort(process.env.PORT || '4000');
// Définir le port de l'application Express
app.set('port', port);

// Fonction de gestion des erreurs du serveur
const errorHandler = error => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

// Créer un serveur HTTP en utilisant l'application Express
const server = http.createServer(app);

// Gérer les erreurs du serveur
server.on('error', errorHandler);
// Serveur écoute les connexions
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

// Démarrer le serveur en écoutant le port spécifié
server.listen(port);
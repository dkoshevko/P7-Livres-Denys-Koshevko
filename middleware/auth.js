const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Récupérer le token d'authentification du header de la requête
        const token = req.headers.authorization.split(' ')[1];

        // Vérifier et décoder le token à l'aide de la clé secrète
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Extraire l'ID utilisateur du token décodé
        const userId = decodedToken.userId;

        // Ajouter l'ID utilisateur à l'objet `auth` de la requête pour une utilisation ultérieure
        req.auth = {
            userId: userId
        };

        // Passer à l'étape suivante du middleware
        next();
    } catch(error) {
        // En cas d'erreur de vérification du token, renvoyer une réponse d'erreur d'authentification
        res.status(401).json({ error });
    }
};
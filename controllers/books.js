// Importer le modèle de données pour les livres
const Book = require('../models/Book');
// Importer le module 'fs' pour la gestion des fichiers
const fs = require('fs');

// Créer un livre
exports.createBook = (req, res, next) => {
    // Obtenir les données du livre à partir du corps de la requête
    const bookObject = JSON.parse(req.body.book);
    // Supprimer '_id' du livre (s'il existe)
    delete bookObject._id;
    // Supprimer '_userId' du livre (s'il existe)
    delete bookObject._userId;

    const book = new Book({
        ...bookObject, // Utiliser la syntaxe spread (...) pour copier toutes les propriétés de bookObject
        userId: req.auth.userId, // Ajouter l'identifiant de l'utilisateur authentifié au livre
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // Construire l'URL de l'image en utilisant le protocole et le nom de fichier fournis par Multer
    });

    // Sauvegarder le livre dans la base de données
    book.save()
        .then(() => {
            res.status(201).json({ message: 'Livre enregistré' });
        })
        .catch(error => {
            res.status(400).json({ error });
        });
};

// Modifier un livre existant
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book), // Obtenir les données du livre à partir du corps de la requête
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // Mettre à jour l'URL de l'image si un nouveau fichier est téléchargé
    } : { ...req.body };

    // Supprimer _userId du livre (s'il existe)
    delete bookObject._userId;

    // Rechercher le livre à modifier
    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Vérifier si le livre n'existe pas
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé' });
            }
            // Vérifier si l'utilisateur est autorisé à modifier le livre
            if (book.userId != req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé' });
            }

            // Extraire le nom du fichier de l'URL de l'image actuelle
            const currentImageFilename = book.imageUrl.split('/images/')[1];

            // Supprimer l'ancienne image du dossier 'images'
            fs.unlink(`images/${currentImageFilename}`, () => {
                // Mettre à jour le livre avec les nouvelles données
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => {
                        res.status(200).json({ message: 'Livre modifié' });
                    })
                    .catch(error => {
                        res.status(500).json({ error }); // Erreur si la mise à jour du livre échoue
                    });
            });
        })
        .catch(error => {
            res.status(500).json({ error }); // Erreur si la recherche du livre échoue
        });
};


// Supprimer un livre
exports.deleteBook = (req, res, next) => {
    // Rechercher le livre à supprimer
    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Vérifier si le livre n'existe pas
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé' });
            }
            // Vérifier si l'utilisateur est autorisé à supprimer le livre
            if (book.userId != req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé' });
            }

            // Extraire le nom du fichier de l'URL de l'image
            const filename = book.imageUrl.split('/images/')[1];

            // Supprimer le fichier d'image du dossier 'images'
            fs.unlink(`images/${filename}`, () => {
                // Supprimer le livre de la base de données
                Book.deleteOne({ _id: req.params.id })
                    .then(() => {
                        res.status(200).json({ message: 'Livre supprimé' });
                    })
                    .catch(error => {
                        res.status(500).json({ error }); // Erreur si la suppression du livre échoue
                    });
            });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la recherche du livre' }); // Erreur si la recherche du livre échoue
        });
};


// Obtenir les livres avec la meilleure note
exports.getBestRating = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 }) // Tri par ordre décroissant de la note moyenne
        .limit(3) // Limite à 3 résultats
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

  

// Obtenir un seul livre par son id
exports.getOneBook = (req, res, next) => {
    // Rechercher le livre par son identifiant
    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Vérifier si le livre n'est pas trouvé
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé' });
            }
            // Répondre avec le livre trouvé
            res.status(200).json(book);
        })
        .catch(error => {
            res.status(500).json({ error }); // Erreur si la recherche du livre échoue
        });
};


// Obtenir tous les livres
exports.getAllBooks = (req, res, next) => {
    // Rechercher tous les livres
    Book.find()
        .then(books => {
            res.status(200).json(books);
        })
        .catch(error => {
            res.status(500).json({ error }); // Erreur si la recherche des livres échoue
        });
};


// Noter un livre
exports.addRating = async (req, res, next) => {
    const { userId, rating } = req.body;
    const bookId = req.params.id;

    try {
        // Vérifier si l'utilisateur a déjà noté le livre
        const book = await Book.findById(bookId);
        const existingRating = book.ratings.find((rating) => rating.userId === userId);

        if (existingRating) {
        return res.status(400).json({ error: 'L\'utilisateur a déjà noté ce livre.' });
        }

        // Ajouter la nouvelle note à la liste des ratings
        book.ratings.push({ userId, grade: rating });

        // Recalculer la note moyenne
        const totalRatings = book.ratings.length;
        const sumRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
        book.averageRating = sumRatings / totalRatings;

        // Sauvegarder les modifications du livre
        await book.save();

        // Renvoyer le livre mis à jour
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la définition de la note.' });
    }
};

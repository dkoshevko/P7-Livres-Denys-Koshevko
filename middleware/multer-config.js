// Importer le module  "multer"
const multer = require('multer');
const SharpMulter  =  require('sharp-multer');

// Définition des types MIME acceptés pour les fichiers image
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};

const storage = SharpMulter({

    // Définir le dossier de destination des fichiers téléchargés
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    
    imageOptions: {
        fileFormat: 'webp',
        quality: 60,
        resize: { width: 463, height: 595 },
        useTimestamp: true,
    }
});

module.exports = multer({ storage }).single('image');
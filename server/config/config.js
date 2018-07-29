// ==============================
// Puerto
// ==============================
process.env.PORT = process.env.PORT || 3000;

// ==============================
// Entorno
// ==============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

// ==============================
// Vencimiento del token
// ==============================
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;


// ==============================
// SEED de autenticacion
// ==============================
process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'este-es-el-secret'

// ==============================
// Base de datos
// ==============================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URL_DB = urlDB;

// ==============================
// Google Cient ID
// ==============================
process.env.CLIENT_ID = process.env.CLIENT_ID || '980508549375-7skobf1tktnrmjcbe7g3ge6boit1m6k4.apps.googleusercontent.com';
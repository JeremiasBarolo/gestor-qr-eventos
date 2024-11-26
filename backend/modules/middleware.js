const jwt = require("jsonwebtoken");
const fs = require("fs")

// Middleware para validar el token
const validateToken = (req, res, next) => {
    // Excluir el endpoint de login
    if (req.path === '/login' || req.url.includes('/api/v1/validate/')) return next();

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, fs.readFileSync('./key', 'utf8').trim());
        console.log(decoded);
        
        req.TOKEN_DATA = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};
module.exports = {
    validateToken
}

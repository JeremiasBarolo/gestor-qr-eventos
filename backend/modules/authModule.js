const database = require('../db/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');

const getAllUser = async (req, res) => {
    try {
        const { query, release } = await database.connection();

        const User = await query(`SELECT * FROM users `);
            
            
        res.json(User);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getOneUsuario = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id } = req.params;
        const Usuario = await query(`SELECT * FROM users WHERE id_usuario = ${id}`);
        
        res.json(Usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createUser = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        await query(`INSERT INTO User (username, password) 
        VALUES (
        '${req.body.username}', 
        '${hashedPassword}',
        
        )`
        );

        
        res.json('Usuario Creado');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateUser = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id } = req.params;

        
        const currentUser = await query(`SELECT * FROM users WHERE id = ${id}`);
        if (currentUser.length === 0) {
            
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        
        const email = req.body.email ?? currentUser[0].email;
        const username = req.body.username ?? currentUser[0].username;
        

        
        let password = currentUser[0].password;
        if (req.body.password) {
            password = await bcrypt.hash(req.body.password, 10);
        }

        await query(`
            UPDATE User SET 
                email = '${email}',
                password = '${password}',
                username = '${username}'
            WHERE id_usuario = ${id}
        `);

        
        res.json('Usuario actualizado');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const deleteUser = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id } = req.params;
        await query(`DELETE FROM users WHERE id_usuario = ${id}`);
        
        res.json('Usuario Eliminado');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { email, password } = req.body;

        // Consulta al usuario en la base de datos
        const result = await query(`SELECT * FROM users WHERE email = '${email}'`);

        if (result.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const usuario = result[0];
        const isMatch = await bcrypt.compare(password, usuario.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        // Generar el token JWT
        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, email: usuario.email, username: usuario.username }, 
            fs.readFileSync('./key', 'utf8').trim()
        );

        console.log(`Usuario '${usuario.username}' se conectó a la app.`);

        res.json({
            token 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    deleteUser,
    updateUser,
    createUser,
    getAllUser,
    getOneUsuario,
    login
}


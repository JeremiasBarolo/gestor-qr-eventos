const database = require('../db/database');

const getAllQRs = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id_usuario } = req.TOKEN_DATA;

        const QRs = await query(`SELECT * FROM QRS  WHERE id_usuario = ${id_usuario}`);
        await release();
        res.json(QRs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getOneQR = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id } = req.params;
        const { id_usuario } = req.TOKEN_DATA;

        const QR = await query(`SELECT * FROM QRs WHERE id = ${id} AND id_usuario = ${id_usuario}`);
        await release();
        res.json(QR);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createQR = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id_usuario } = req.TOKEN_DATA;


        await query(`INSERT INTO QRs (nombre, apellido, fecha_nacimiento, fecha_defuncion, genero, nacionalidad, dni, fecha_ingreso, id_parcela, id_usuario) 
        VALUES (
        '${req.body.nombre}', 
        '${req.body.apellido}',
        '${req.body.fecha_nacimiento}',
        '${req.body.fecha_defuncion}', 
        '${req.body.genero}',
        '${req.body.nacionalidad}',
        '${req.body.dni}',
        '${req.body.fecha_ingreso}',
        '',
        '${id_usuario}'
        )`
        );
        await release();
        res.json('QR Creado');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateQR = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id } = req.params;
        const { id_usuario } = req.TOKEN_DATA;
        
        const currentQR = await query(`SELECT * FROM QRs WHERE id = ${id} AND id_usuario = ${id_usuario}`);
        if (currentQR.length === 0) {
            await release();
            return res.status(404).json({ error: 'QR no encontrado' });
        }

        
        const nombre = req.body.nombre ?? currentQR[0].nombre;
        const apellido = req.body.apellido ?? currentQR[0].apellido;
        const fecha_nacimiento = req.body.fecha_nacimiento ?? currentQR[0].fecha_nacimiento;
        const fecha_defuncion = req.body.fecha_defuncion ?? currentQR[0].fecha_defuncion;
        const genero = req.body.genero ?? currentQR[0].genero;
        const nacionalidad = req.body.nacionalidad ?? currentQR[0].nacionalidad;
        const dni = req.body.dni ?? currentQR[0].dni;
        const fecha_ingreso = req.body.fecha_ingreso ?? currentQR[0].fecha_ingreso;

        await query(`
            UPDATE QRs SET 
                nombre = '${nombre}',
                apellido = '${apellido}',
                fecha_nacimiento = '${fecha_nacimiento}',
                fecha_defuncion = '${fecha_defuncion}',
                fecha_ingreso = '${fecha_ingreso}',
                genero = '${genero}',
                nacionalidad = '${nacionalidad}',
                dni = '${dni}'
                
            WHERE id = ${id}
        `);

        await release();
        res.json('QR actualizado');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const deleteQR = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id } = req.params;
        await query(`DELETE FROM QRs WHERE id = ${id}`);
        await release();
        
        res.json('QR Eliminado');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllQRs,
    getOneQR,
    createQR,
    updateQR,
    deleteQR
}
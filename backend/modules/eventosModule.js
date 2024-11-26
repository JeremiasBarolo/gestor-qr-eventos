const database = require('../db/database');
const QRCode = require('qrcode');

const getAllEventos = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id } = req.TOKEN_DATA;

        const Eventos = await query(`SELECT * FROM eventos  WHERE id_usuario = ${id}`);
        await release();
        res.json(Eventos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getOneEvento = async (req, res) => {
  try {
    const { query, release } = await database.connection();
    const { id } = req.params;

    // Consulta a la base de datos para obtener el evento y las entradas (QRs)
    const evento = await query(`
      SELECT 
        e.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', q.id,
            'uuid', q.uuid,
            'usado', q.usado
          )
        ) AS entradas
      FROM eventos e
      LEFT JOIN entradas q ON e.id = q.id_evento
      WHERE e.id = ${id} AND e.id_usuario = ${req.TOKEN_DATA.id}
      GROUP BY e.id
    `);

    // Si no se encuentra el evento, devolver error 404
    if (!evento || evento.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado o no autorizado' });
    }

    

  
    await release();
    res.json({
      evento: evento[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEvento = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id } = req.TOKEN_DATA;


        await query(`INSERT INTO eventos (nombre_evento, id_usuario, fecha_evento) 
        VALUES (
        '${req.body.nombre_evento}', 
        '${id}',
        '${req.body.fecha_evento}'
        )`
        );
        await release();
        res.json('Evento Creado');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateEvento = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id } = req.params;
        
        
        const currentEvento = await query(`SELECT * FROM eventos WHERE id = ${id} AND id_usuario = ${req.TOKEN_DATA.id}`);
        if (currentEvento.length === 0) {
            await release();
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        
        const nombre_evento = req.body.nombre_evento ?? currentEvento[0].nombre_evento;
        const fecha_evento = req.body.fecha_evento ?? currentEvento[0].fecha_evento;
        
       
        await query(`
            UPDATE eventos SET 
                nombre_evento = '${nombre_evento}',
                fecha_evento = '${fecha_evento}'
            WHERE id = ${id}
        `);

        await release();
        res.json('Evento actualizado');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const deleteEvento = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id } = req.params;
        await query(`DELETE FROM eventos WHERE id = ${id}`);
        await release();
        
        res.json('Evento Eliminado');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllEventos,
    getOneEvento,
    createEvento,
    updateEvento,
    deleteEvento
}
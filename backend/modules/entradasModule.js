const database = require('../db/database');
const { v4: uuidv4 } = require('uuid');


const leerQR = async (req, res) => {
    try {
      const { query, release } = await database.connection();
      const { uuid } = req.params;
      
      
      const entrada = await query(`SELECT * FROM entradas WHERE uuid = '${uuid}'`);
      
      
      const evento = await query(`SELECT fecha_evento FROM eventos WHERE id = '${entrada[0].id_evento}'`);
      
      
      if (evento.length === 0) {
          return res.status(404).json({ message: "Evento no encontrado" });
      }
      
      
      const fechaHoy = new Date().setHours(0, 0, 0, 0);  
      const fechaEvento = new Date(evento[0].fecha_evento).setHours(0, 0, 0, 0);  
      
      
        if (fechaHoy === fechaEvento) {


          if (entrada[0].usado == 0) {
              
              await query(`UPDATE entradas SET usado = 1 WHERE uuid = '${uuid}'`);
              res.json({ message: "Entrada validada y marcada como utilizada." });

          } else {
              
              res.status(400).json({ message: "Esta entrada ya ha sido utilizada." });
          }


      } else {
          
          res.status(400).json({ message: "La fecha del evento no coincide con la fecha actual." });
      }


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

const generarEntradas = async (req, res) => {
    try {
      const { query, release } = await database.connection();
      const { id } = req.TOKEN_DATA;
  
      const { id_evento, cantidad } = req.body;
  
      if (!id_evento || !cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'ID de evento y cantidad son requeridos.' });
      }
  
      const entradas = [];
  
      
      for (let i = 0; i < cantidad; i++) {
        const uuid = uuidv4().replace(/-/g, '').slice(0, 11); 
        entradas.push([uuid, 0, id_evento]);
      }
  
      // Insertar las entradas en la base de datos
      const values = entradas.map(() => `(?, ?, ?)`).join(', ');
      const sql = `INSERT INTO entradas (uuid, usado, id_evento) VALUES ${values}`;
      const flattenedValues = entradas.flat();
  
      await query(sql, flattenedValues);
  
      await release();
   
     
  
      // Responder con los QR generados
      res.json({
        message: 'QRs creados',
        total: cantidad
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

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
     leerQR,
    getOneQR,
    generarEntradas,
    updateQR,
    deleteQR
}
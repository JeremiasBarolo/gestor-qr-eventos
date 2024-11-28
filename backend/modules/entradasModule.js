const database = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path')


const leerQR = async (req, res) => {
    try {
      const { query, release } = await database.connection();
      const { uuid } = req.params;
      
      
      const entrada = await query(`SELECT * FROM entradas WHERE uuid = '${uuid}'`);
      
      
      const evento = await query(`SELECT fecha_evento FROM eventos WHERE id = '${entrada[0].id_evento}'`);
      
      
      if (evento.length === 0) {
          return res.sendFile(path.join(__dirname, '../templates/basic-error.html'));
      }
      
      
      const fechaHoy = new Date().setHours(0, 0, 0, 0);  
      const fechaEvento = new Date(evento[0].fecha_evento).setHours(0, 0, 0, 0);  
      
      
        if (fechaHoy === fechaEvento) {


          if (entrada[0].usado == 0) {
              
              await query(`UPDATE entradas SET usado = 1 WHERE uuid = '${uuid}'`);
              res.sendFile(path.join(__dirname, '../templates/ok.html'));

          } else {
              
            res.sendFile(path.join(__dirname, '../templates/error.html'));
          }


      } else {
          
        res.sendFile(path.join(__dirname, '../templates/fecha.html'));
      }


    } catch (error) {
        return res.sendFile(path.join(__dirname, '../templates/basic-error.html'));
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
  
      
      
      
      let id_bloque = 1
      const result = await query("SELECT * FROM entradas WHERE id_evento = ? ORDER BY id_bloque DESC LIMIT 1", [id_evento]);
      if(result.length > 0){
        id_bloque = result[0].id_bloque + 1
      }

      for (let i = 0; i < cantidad; i++) {
        const uuid = uuidv4(); 
        entradas.push([uuid, 0, id_evento, id_bloque]);
      }

      // Insertar las entradas en la base de datos
      const values = entradas.map(() => `(?, ?, ?, ?)`).join(', ');
      const sql = `INSERT INTO entradas (uuid, usado, id_evento, id_bloque) VALUES ${values}`;
      const flattenedValues = entradas.flat();
  
      await query(sql, flattenedValues);
  
      await release();
   
     
  
      // Responder con los QR generados
      res.json({
        message: 'QRs creados',
        total: cantidad
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message });
    }
  };


const deleteQR = async (req, res) => {
    try {
        const { query, release } = await database.connection();
        const { id } = req.params;
        await query(`DELETE FROM entradas WHERE id = ${id}`);
        await release();
        
        res.json('Entrada Eliminada');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



module.exports = {
  leerQR,
  generarEntradas,
  deleteQR
}
// Requires
const express = require("express")
const { 
    authModule,
    entradasModule,
    eventosModule,
    middlewareModule

 } = require('./modules')

const cors = require("cors");

require('dotenv').config();


// App Creation
const app = express();
const PORT = process.env.PORT || 8080;




app.use(express.json()) 
app.use(cors());
app.use(middlewareModule.validateToken); 


// QR

app.get("/api/v1/entradas/:id", entradasModule.getOneQR);
app.get("/api/v1/validation/:uuid", entradasModule.leerQR);
app.post('/api/v1/entradas', entradasModule.generarEntradas);
app.patch('/api/v1/entradas/:id', entradasModule.updateQR);
app.delete('/api/v1/entradas/:id', entradasModule.deleteQR);


// EVENTOS

app.get("/api/v1/eventos/:id", eventosModule.getOneEvento);
app.get("/api/v1/eventos", eventosModule.getAllEventos);
app.post('/api/v1/eventos', eventosModule.createEvento);
app.patch('/api/v1/eventos/:id', eventosModule.updateEvento);
app.delete('/api/v1/eventos/:id', eventosModule.deleteEvento);




// USUARIOS

app.get("/api/v1/usuarios/:id", authModule.getOneUsuario);
app.get("/api/v1/usuarios", authModule.getAllUser);
app.post('/api/v1/usuarios', authModule.createUser);
app.patch('/api/v1/usuarios/:id', authModule.updateUser);
app.delete('/api/v1/usuarios/:id', authModule.deleteUser);



// LOGIN
app.post('/login', authModule.login);





app.listen(PORT, 
    async () => {
        console.log(` >>>>> 🚀 Server started at http://localhost:${PORT}`);
})
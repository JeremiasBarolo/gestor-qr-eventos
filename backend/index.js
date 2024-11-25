// Requires
const express = require("express")
const { 
    authModule,
    qrModule,
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

app.get("api/v1/QR/:id", qrModule.getOneQR);
app.get("api/v1/QR", qrModule.getAllQRs);
app.post('api/v1/QR', qrModule.createQR);
app.patch('api/v1/QR/:id', qrModule.updateQR);
app.delete('api/v1/QR/:id', qrModule.deleteQR);


// EVENTOS

app.get("api/v1/eventos/:id", eventosModule.getOneEvento);
app.get("api/v1/eventos", eventosModule.getAllEventos);
app.post('api/v1/eventos', eventosModule.createEvento);
app.patch('api/v1/eventos/:id', eventosModule.updateEvento);
app.delete('api/v1/eventos/:id', eventosModule.deleteEvento);




// USUARIOS

app.get("api/v1/auth/:id", authModule.getOneUser);
app.get("api/v1/auth", authModule.getAllUsers);
app.post('api/v1/auth', authModule.createUser);
app.patch('api/v1/auth/:id', authModule.updateUser);
app.delete('api/v1/auth/:id', authModule.deleteUser);



// LOGIN
app.post('/login', authModule.login);





app.listen(PORT, 
    async () => {
        console.log(` >>>>> 🚀 Server started at http://localhost:${PORT}`);
})
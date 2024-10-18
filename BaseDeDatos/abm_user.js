const express = require('express');
const mongoose = require('mongoose');
const app = express();
mongoose.connect('mongodb://localhost:27017/alumnos', {
    useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => {
    console.log("Conexión a MongoDB establecida.");
}).catch(error => {
    console.error("Error al conectar a MongoDB:", error.message);
});
//Esquema de usuario
const usuarioSchema = mongoose.Schema({
    nombre: String,
    email: String,
    edad: Number
});

const Usuario = mongoose.model('Usuario', usuarioSchema);
app.use(express.json());

// Crear un nuevo usuario
app.post('/usuarios', async (req, res) => {
    try {
        const usuario = new Usuario(req.body);
        await usuario.save();
        res.status(201).json(usuario);
    } catch (error) {
        res.status(400).json({ mensaje: error.message});
    }
});

const PORT = 3000;
app.listen(PORT,() =>{
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
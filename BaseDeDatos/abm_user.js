// Importamos las dependencias
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Conectar a la base de datos MongoDB
mongoose.connect('mongodb://localhost:27017/alumnos', {
/*     useNewUrlParser: true,
    useUnifiedTopology: true  */
}).then(() => {
    console.log("Conexión a MongoDB establecida.");
}).catch(error => {
    console.error("Error al conectar a MongoDB:", error.message);
});

// Definimos el esquema de usuario
const usuarioSchema = mongoose.Schema({
    nombre: String,
    email: String,
    edad: Number
});

// Creamos un modelo de usuario basado en el esquema
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Para pasar el cuerpo de las solicitudes como JSON
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
// Eliminar un usuario por ID
app.delete('/usuarios/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (usuario) {
            res.json({ mensaje: "Usuario eliminado correctamente."});
        }
        else {
            res.status(404).json({ mensaje: error.message});
        }
    } catch (error) {
        res.status(500).json({ mensaje: error.message});
    }    
});

// Visualizar todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: error.message});
    }
});

// Buscar un usuario por ID
app.get('/usuarios/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);

        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).json({ mensaje: "Usuario no encontrado."});
        }
    } catch (error) {
        res.status(500).json({ mensaje: error.message});
    }
});

// Modificar un dato de usuario por ID (ejemplo modificar la edad de uno de los usuarios)
app.put('/usuarios/:id', async (req, res) => {
    try {
        const { edad } = req.body; //extraigo la edad 
        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id, //id del usuario a modificar
            { edad }, //actualizo solo la edad
            { new: true } //devuelve solo la edad
        );

        if (usuario) {
            res.json(usuario); //devuelve el usuario actualizado
        } else {
            res.status(404).json({ mensaje: "Usuario no encontrado." }); 
        }
    } catch (error) {
        res.status(500).json({ mensaje: error.message }); 
    }
});

// Configuramos el puerto del servidor
const PORT = 3000;

// Iniciamos el servidor y escuchamos en el puerto
app.listen(PORT,() =>{
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
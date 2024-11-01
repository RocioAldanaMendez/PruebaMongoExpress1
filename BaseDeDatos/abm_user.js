// Importamos las dependencias
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Conectar a la base de datos MongoDB
mongoose.connect('mongodb://localhost:27017/alumnos')
    .then(() => {
        console.log("Conexión a MongoDB establecida.");
        crearRolesYPermisos(); // Llamar a esta función después de la conexión
    })
    .catch(error => console.error("Error al conectar a MongoDB:", error.message));

// Definimos el esquema de usuario
const usuarioSchema = mongoose.Schema({
    nombre: String,
    email: String,
    edad: Number,
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' } // Asociación con rol
});

// Definimos el esquema de rol
const roleSchema = mongoose.Schema({
    nombre: String,
    permisos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permiso' }]
});

// Definimos el esquema de permiso
const permisoSchema = mongoose.Schema({
    nombre: String,
    descripcion: String
});

// Creamos modelos basados en los esquemas
const Usuario = mongoose.model('Usuario', usuarioSchema);
const Role = mongoose.model('Role', roleSchema);
const Permiso = mongoose.model('Permiso', permisoSchema);

// Para pasar el cuerpo de las solicitudes como JSON
app.use(express.json());

// Middleware para verificar permisos
function verificarPermiso(nombrePermiso) {
    return async (req, res, next) => {
        try {
            const usuario = await Usuario.findById(req.body.userId).populate({
                path: 'role',
                populate: { path: 'permisos' }
            });

            if (!usuario) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }

            // Comprobar si el usuario tiene el permiso necesario
            const tienePermiso = usuario.role.permisos.some(permiso => permiso.nombre === nombrePermiso);

            if (!tienePermiso) {
                return res.status(403).json({ mensaje: 'Acceso denegado: permiso insuficiente' });
            }

            next();
        } catch (error) {
            res.status(500).json({ mensaje: error.message });
        }
    };
}

// Rutas CRUD para usuarios con control de acceso

// Crear un nuevo usuario (requiere permiso 'crear_usuario')
app.post('/usuarios', verificarPermiso('crear_usuario'), async (req, res) => {
    try {
        const usuario = new Usuario(req.body);
        await usuario.save();
        res.status(201).json(usuario);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

// Eliminar un usuario por ID (requiere permiso 'eliminar_usuario')
app.delete('/usuarios/:id', verificarPermiso('eliminar_usuario'), async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (usuario) {
            res.json({ mensaje: "Usuario eliminado correctamente." });
        } else {
            res.status(404).json({ mensaje: "Usuario no encontrado." });
        }
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Visualizar todos los usuarios (requiere permiso 'ver_usuarios')
app.get('/usuarios', verificarPermiso('ver_usuarios'), async (req, res) => {
    try {
        const usuarios = await Usuario.find().populate('role');
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Buscar un usuario por ID (requiere permiso 'ver_usuarios')
app.get('/usuarios/:id', verificarPermiso('ver_usuarios'), async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id).populate('role');
        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).json({ mensaje: "Usuario no encontrado." });
        }
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Modificar un usuario (requiere permiso 'modificar_usuario')
app.put('/usuarios/:id', verificarPermiso('modificar_usuario'), async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).json({ mensaje: "Usuario no encontrado." });
        }
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Crear roles y permisos solo si no existen
async function crearRolesYPermisos() {
    try {
        const count = await Role.countDocuments();
        if (count > 0) {
            console.log("Roles y permisos ya existen.");
            return; // Termina la función si ya existen roles
        }

        const permisoCrear = new Permiso({ nombre: 'crear_usuario', descripcion: 'Permite crear nuevos usuarios' });
        const permisoEliminar = new Permiso({ nombre: 'eliminar_usuario', descripcion: 'Permite eliminar usuarios' });
        const permisoVer = new Permiso({ nombre: 'ver_usuarios', descripcion: 'Permite ver todos los usuarios' });
        const permisoModificar = new Permiso({ nombre: 'modificar_usuario', descripcion: 'Permite modificar datos de usuarios' });

        await permisoCrear.save();
        await permisoEliminar.save();
        await permisoVer.save();
        await permisoModificar.save();

        const rolAdmin = new Role({ nombre: 'Administrador', permisos: [permisoCrear._id, permisoEliminar._id, permisoVer._id, permisoModificar._id] });
        const rolUsuario = new Role({ nombre: 'Usuario', permisos: [permisoVer._id] });

        await rolAdmin.save();
        await rolUsuario.save();

        console.log("Roles y permisos creados con éxito.");
    } catch (error) {
        console.error("Error al crear roles y permisos:", error.message);
    }
}

// Configuramos el puerto del servidor
const PORT = 3000;

// Iniciamos el servidor y escuchamos en el puerto
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

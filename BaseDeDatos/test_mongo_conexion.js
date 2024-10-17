console.log("Entrando al servidor");
try {
  const { MongoClient } = require ('mongodb');
  const client = new MongoClient ('mongodb://localhost:27017');
  client.connect()
        .then(() => console.log("La conexion fue exitosa!"))
        .catch(error => console.log("La conexion fallo.", error));
} catch (error) {
    console.log("Error al establecer la conexion con MongoDB", error);
}

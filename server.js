// server.js
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

const schema = fs.readFileSync('./schema.graphql', 'utf-8');
const datos = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

const root = {
  obtenerHorasDeApertura: () => datos.restaurantes[0].horasDeApertura,
  obtenerMesasDisponibles: () =>
    datos.mesas.filter((mesa) => mesa.estado === "disponible"),
  obtenerTodasLasReservas: () => datos.reservas,
  crearMesa: ({ numero, capacidad }) => {
    const nuevaMesa = {
      id: datos.mesas.length + 1,
      numero,
      capacidad,
      estado: "disponible",
    };
    datos.mesas.push(nuevaMesa);
    return nuevaMesa;
  },
  crearReserva: ({ numeroDePersonas, idMesa, nombreCliente }) => {
    const mesa = datos.mesas.find(
      (mesa) => mesa.id === idMesa && mesa.estado === "disponible"
    );
    if (!mesa) {
      throw new Error("La mesa no está disponible.");
    }

    const nuevaReserva = {
      id: datos.reservas.length + 1,
      numeroDePersonas,
      mesa,
      nombreCliente,
      estado: "confirmada",
    };

    mesa.estado = "reservada";
    datos.reservas.push(nuevaReserva);

    return nuevaReserva;
  },
};

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(schema),
    rootValue: root,
    graphiql: true, // Habilita la interfaz GraphiQL para pruebas
  })
);

app.listen(3000, () => {
  console.log("Servidor GraphQL iniciado en http://localhost:3000/graphql");
});
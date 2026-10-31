// Crea las dos cuentas de prueba sin borrar usuarios, gremios ni fórmulas.
// Uso: npm run seed
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/Usuario');

const USUARIOS_PRUEBA = [
  {
    nombre: 'Ana López',
    email: 'ana@potionlab.test',
    password: 'alquimia123',
    specialty: 'Botany',
    role: 'user',
  },
  {
    nombre: 'Erick Rivas',
    email: 'erick@potionlab.test',
    password: 'alquimia123',
    specialty: 'Brewing',
    role: 'admin',
  },
];

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error('Falta MONGO_URI en las variables de entorno.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB');

  for (const datos of USUARIOS_PRUEBA) {
    const usuarioExistente = await User.findOne({ email: datos.email });

    if (usuarioExistente) {
      usuarioExistente.nombre = datos.nombre;
      usuarioExistente.password = datos.password;
      usuarioExistente.specialty = datos.specialty;
      usuarioExistente.role = datos.role;

      await usuarioExistente.save();

      console.log(`Cuenta de prueba actualizada: ${datos.email} (${datos.role})`);
      continue;
    }

    const usuario = new User(datos);
    await usuario.save();

    console.log(`Cuenta creada: ${datos.email} (${datos.role})`);
  }

  console.log('\nContraseña de las cuentas creadas: alquimia123');
}

seed()
  .catch((error) => {
    console.error('Error en el seed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

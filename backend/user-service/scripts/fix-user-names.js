const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketing-platform')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Definir schema simple
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  firstName: String,
  lastName: String,
  role: String
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function fixUserNames() {
  try {
    console.log('🔍 Buscando usuarios sin firstName...');
    
    // Encontrar usuarios sin firstName o con firstName vacío
    const usersWithoutFirstName = await User.find({
      $or: [
        { firstName: { $exists: false } },
        { firstName: null },
        { firstName: '' }
      ]
    });

    console.log(`📊 Encontrados ${usersWithoutFirstName.length} usuarios sin firstName`);

    if (usersWithoutFirstName.length === 0) {
      console.log('✅ Todos los usuarios ya tienen firstName');
      process.exit(0);
    }

    // Actualizar cada usuario
    for (const user of usersWithoutFirstName) {
      console.log(`🔄 Actualizando usuario: ${user.username} (${user.email})`);
      
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            firstName: user.username, // Usar username como firstName
            lastName: user.lastName || '' // Mantener lastName o vacío
          }
        }
      );
      
      console.log(`✅ Usuario ${user.username} actualizado`);
    }

    console.log('\n🎉 ¡Todos los usuarios actualizados correctamente!');
    
    // Mostrar resumen
    const allUsers = await User.find({}, 'username email firstName lastName');
    console.log('\n📋 Resumen de usuarios:');
    allUsers.forEach(u => {
      console.log(`  - ${u.username}: firstName="${u.firstName}", lastName="${u.lastName}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar
fixUserNames();

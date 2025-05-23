import mongoose from 'mongoose';

// --- CONECTAR CON DB-----------//
async function connectDB() {
  try {
    await mongoose.connect(
      "mongodb+srv://prueba123:oto135135@venusdb.e2z9zhh.mongodb.net/?retryWrites=true&w=majority&appName=VenusDB"
    );
    console.log('✅ Me conecté a la base de datos');
  } catch (err) {
    console.error('❌ Error al conectar a MongoDB:', err);
  }
}













export { connectDB };

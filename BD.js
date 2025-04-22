const mongoose = require('mongoose');





// --- CONECTAR CON DB-----------//
async function connectDB() {
    try {
      await mongoose.connect("mongodb+srv://prueba123:oto135135@venusdb.e2z9zhh.mongodb.net/?retryWrites=true&w=majority&appName=VenusDB"
      );
      console.log('✅ Me conecte a la base de datos');
    } catch (err) {
      console.error('❌ Error al conectar a MongoDB:', err);
    }
  }
  

 





    const RelacionSchema = new mongoose.Schema({
        _id: {
            type: String, 
            required: true,
          },
        nombre: {
            type: String, 
            required: true,
          },  
        descripcion: {
          type: String,
          required: false,
          default:" ",
        },
        relacion: {
            type: Number,
            required: true,
            default:0,
          },
    
      });
      

      const Relacion = mongoose.models.Relacion || mongoose.model('Relacion', RelacionSchema);






      async function BuscarInfoDePersonaDB(mensaje){
        let info; 
        let Datos = await Recuerdo.findOne({_id:mensaje.author.id})
        if(Datos){
            info = ("INFORMACION DEL USUARIO:" + Datos.datos )
            console.log("Datos encontrados")
        }else{
            const nuevo = new Recuerdo({_id:mensaje.author.id,nombre:mensaje.author.username});
            await nuevo.save();
            console.log("GUARDADO!")
        }
    
    
        return info
    }




    module.exports = {connectDB,BuscarInfoDePersonaDB,Relacion};
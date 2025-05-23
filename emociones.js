import mongoose from 'mongoose';


//--------------Esquema emocional---------------------//
const OpinionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
    default: "venus",
  },
   ira: {
    type: Number,
    required: true,
    default: 0,
  },
  temor: {
    type: Number,
    required: true,
    default: 0,
  },
  amor: {
    type: Number,
    required: true,
    default: 0,
  },
  tristeza: {
    type: Number,
    required: true,
    default: 0,
  },
  alegria: {
    type: Number,
    required: true,
    default: 0,
  },
  },
);


const Opinion = mongoose.models.Opinion || mongoose.model('Opinion', OpinionSchema);









//------------------------------------- Regulacion Emocional --------------------------//
 async function AutoRegularse(datos) {
  datos = await ObtenerEmociones()
  const decaimiento = 5; 
  return {
    ira: Math.max(0, datos.ira - decaimiento),
    temor: Math.max(0, datos.temor - decaimiento),
    amor: Math.max(0, datos.amor - decaimiento),
    tristeza: Math.max(0, datos.tristeza - decaimiento),
    alegria: Math.max(0, datos.alegria - decaimiento),
  };
}








//-------------------------------------------------------- Obtencion Emocional en BD --------------------//
export async function ObtenerEmociones() {
  const ID_VENUS = "003";
  let Datos = await Opinion.findOne({ _id: ID_VENUS });
  if (Datos) {
    return {
      ira: Datos.ira,
      temor: Datos.temor,
      amor: Datos.amor,
      tristeza: Datos.tristeza,
      alegria: Datos.alegria,
    };
  } else {
    const nuevo = new Opinion({ _id: ID_VENUS, nombre: "venus" });
    await nuevo.save();
    return await ObtenerEmociones();
  }
}


  






//------------------------------------ Modificacion emocional en BD---------------------//
export async function ModificarEmociones(cambios) {
  const ID_VENUS = "003";
  const emocionesReguladas = await AutoRegularse();

  const Datos = await Opinion.findOne({ _id: ID_VENUS });

  if (!Datos) {
    await Opinion.create({
      _id: ID_VENUS,
      nombre: "venus",
      ira: Math.min(100, Math.max(0, emocionesReguladas.ira + cambios.ira)),
      temor: Math.min(100, Math.max(0, emocionesReguladas.temor + cambios.temor)),
      amor: Math.min(100, Math.max(0, emocionesReguladas.amor + cambios.amor)),
      tristeza: Math.min(100, Math.max(0, emocionesReguladas.tristeza + cambios.tristeza)),
      alegria: Math.min(100, Math.max(0, emocionesReguladas.alegria + cambios.alegria)),
    });
  } else {
    const nuevasEmociones = {
      ira: Math.min(100, Math.max(0, emocionesReguladas.ira + cambios.ira)),
      temor: Math.min(100, Math.max(0, emocionesReguladas.temor + cambios.temor)),
      amor: Math.min(100, Math.max(0, emocionesReguladas.amor + cambios.amor)),
      tristeza: Math.min(100, Math.max(0, emocionesReguladas.tristeza + cambios.tristeza)),
      alegria: Math.min(100, Math.max(0, emocionesReguladas.alegria + cambios.alegria)),
    };

    await Opinion.updateOne(
      { _id: ID_VENUS },
      {
        $set: nuevasEmociones,
      }
    );
  }
}






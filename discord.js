import { Client, Events, GatewayIntentBits} from 'discord.js';
import { connectDB, } from './BD.js';
import dotenv from 'dotenv';
import { GuardarMensaje, LeerMensajes } from './Utilidades.js';
import { AnalizarIntencion, esRespuestaDirecta, GenerarResumen } from './Comportamiento/AI.js';
import { guardarResumen } from './Comportamiento/resumenes.js';


dotenv.config();



const token = process.env.TOKEN_DISCORD;

let RBK = {
  servidor: "",
  Canal: {
    Pruebas:"",
    General:"",
  },
  Rol:{
    Nuevos: ""
  }
}




//-------------------Discord Intents-------------------------//
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions, 
    GatewayIntentBits.GuildVoiceStates,
  ],
});








//------------------------------Evento inicio Bot--------------------------------/
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`😊 Buenos dias shule.`);
  console.log('✅ Me conecte con discord ');
  

  connectDB();
  RBK.servidor = await client.guilds.fetch("465587665161420800")
  RBK.Canal.Pruebas = await client.channels.fetch('1370992005940777141');
  RBK.Canal.General  = await client.channels.fetch("489600496416456714");
  RBK.Rol.Nuevos = await RBK.servidor.roles.cache.get("1279119860563050620")
});





//----------------------------Bienvenida-----------------------------//
client.on(Events.GuildMemberAdd, async (member) => {   
});



//-------------------------------Salida-------------------------------//
client.on(Events.GuildMemberRemove, async (member) => {
});






//se podria agregar un cooldown para evitar a los mogolicos que hablan en partes. 
let contador= 0;

//------------------Evento Mensaje------------------------------//
client.on(Events.MessageCreate, async (mensaje) => {
  await GuardarMensaje(mensaje)
  
  console.log(contador)
  if (mensaje.author.bot) return;
  contador++

  if(contador >= 3){
    
    let resumen = await GenerarResumen(await LeerMensajes(10)) 
    await guardarResumen(resumen.respuesta)
   
  }



  if( (mensaje.channel == RBK.Canal.General || mensaje.channel == RBK.Canal.Pruebas)){


    if (mensaje.mentions.has(client.user) || await esRespuestaDirecta(await LeerMensajes(10))) {
         console.log("aa")
          await AnalizarIntencion(await LeerMensajes(1))
    }else{
          console.log(false)
        }



    }

    
});





//----Run Client----//
client.login(token);





















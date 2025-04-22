const { Client, Events, GatewayIntentBits } = require('discord.js');
const { GoogleGenAI } = require ('@google/genai')
const ai = new GoogleGenAI({	apiKey: process.env.GEMINI_API_KEY, });
const {connectDB,Relacion,BuscarInfoDePersonaDB} = require ("./BD")
const GenerarRespuesta = require("./AI");
const dotenv = require( 'dotenv');
dotenv.config();
const token = process.env.TOKEN_DISCORD ;
let modocharla = false;    


//-------------------Discord Intents-------------------------//
const client = new Client({intents: [  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers, ]});
let canal;

	
	

//------------------------------Evento inicio Bot--------------------------------/
client.once(Events.ClientReady,async (readyClient) => {
	console.log(`😊 Buenos dias shule.`);
	console.log('✅ Me conecte con discord ');
	connectDB()	
	 canal = await client.channels.fetch("1362163042284077356")
});






//----------------------------Bienvenida-----------------------------//

client.on(Events.GuildMemberAdd, async member => {
	console.log("AAAAAAAAAA")
	let respuesta = await GenerarRespuesta(`El usuario ${"<@" + member.user.id + ">"} ingreso al grupo, dale la bienvenida`)
	canal.send(respuesta)
   
})




//-------------------------------Salida-------------------------------//
client.on(Events.GuildMemberRemove, async member => {
	let respuesta = await GenerarRespuesta(`El usuario ${member.user.username} salio del grupo, burlate de ello `)
	canal.send(respuesta)
})


 




//------------------Evento Mensaje------------------------------//
client.on(Events.MessageCreate, async mensaje => {
	if (mensaje.author.bot) return;
  
	if (mensaje.content.toLowerCase().includes("venus")) {
	  modocharla = true;
	}
  
	if (puedeHablar(mensaje)) {
	let respuesta = await GenerarRespuesta(await buscarMensajes(mensaje), mensaje);

	 if(respuesta != null) mensaje.channel.send(respuesta)
	}
  });
  



//----Run Client----//
client.login(token);
















//-------------- Chequea si venus puede o no hablar ------------------------ //
function puedeHablar(mensaje){
	return modocharla && (mensaje.channel.id == "489600496416456714" || mensaje.channel.id == "1362163042284077356" )
}






//------------------Busca, filtra y procesa los ultimos mensajes para convertirlos en un prompt-------------------------//
async function buscarMensajes(mensaje){
	let mensajesRecientes = await mensaje.channel.messages.fetch({ limit: 10 });
	let ultimosMensajes = mensajesRecientes.reverse().filter(m => m.content?.trim().length > 0).map(m => `${m.author.username}: ${m.content}`)
    ultimosMensajes[ultimosMensajes.length-1] = "}. \n\n MENSAJE ACTUAL:" + ultimosMensajes[ultimosMensajes.length-1] 
    let mensajeFinal = ultimosMensajes.join('\n');
	//let recuerdosDePersona = await BuscarInfoDePersonaDB(mensaje)
	//let historialYMensaje = "ESTOS SON LOS RECUERDOS QUE TIENES DE LA PERSONA ACTUAL USALOS SOLO SI ES NESCESARIO: " + recuerdosDePersona + "\n" + `HISTORIAL DEL CHAT. USALO UNICAMENTE COMO CONTEXTO DE LAS CONVERSACIONES {\n ${mensajeFinal}`;
   
	console.log(mensajeFinal)
	return ("Historial de mensajes recientes, utilizar solamente de ser necesario { " + mensajeFinal)
}













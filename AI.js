import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {GuardarInformacion} from './BDVect.js';
import {BuscarInformacion} from './BDVect.js';
import {setPuedeHablar} from './discord.js';
import * as Prompts from './prompts.js';
import { ObtenerEmociones,ModificarEmociones } from './emociones.js';
dotenv.config();



const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const ai_auxiliar = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_AUXILIAR,
});






//--------------------------------- FUNCTION CALLBACKS FUNCIONES----------------------------//

function detectarcontexto(contexto) {
  
  return contexto             
}


async function buscarinfo(contenido,input,autor,cana) {
	console.log("HOLAA")                            //<-------------------- BUSQUEDA VECTORIAL : OUTPUT
	return await GenerarSinCallbackRespuesta(`**INFORMACION ANTERIOR USALO COMO CONTEXTO \n { ${input}} \n Esta fue la informacion que conseguiste en la base de datos : ` + await BuscarInformacion(`Consulta de ${autor} ` + contenido) )
}

async function guardarinfo(contenido, autor) {
	await GuardarInformacion(contenido, autor);            //<-------------------- BUSQUEDA VECTORIAL : INPUT
	return `**${await GenerarSinCallbackRespuesta(`ACABAS DE GUARDAR ${contenido} EN TU BASE DE DATOS, INFORMALO.`)}**`
  }



  async function ajustaremociones(emociones,persona ,input) {
    await ModificarEmociones(emociones);
    const estadoEmocional = await ObtenerEmociones();                 //<----------------- Manejo emocional
    const promptEmociones = `Tus emociones actuales hacia son: 
  - Ira: ${estadoEmocional.ira}
  - Temor: ${estadoEmocional.temor}
  - Amor: ${estadoEmocional.amor}
  - Tristeza: ${estadoEmocional.tristeza}
  - Alegría: ${estadoEmocional.alegria}`;
    const promptFinal = `${promptEmociones}\n\n Ahora responde al siguiente input teniendo en cuenta este estado emocional:\n${input}`;
    return await GenerarRespuesta(promptFinal, persona);
  }
  














  // ------------------- GENERACION CON IA-------------------------//




  export async function AnalizarCargaEmocional(input,persona) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: input,
      config: {
      systemInstruction: (
        ` Después de procesar cada mensaje del usuario, debes evaluar cómo afectó a tus emociones.
🔧 **Valores emocionales:** Cada emoción tiene un valor entre 0 y 100.
- Nunca debes exceder esos límites.
- Si el mensaje no genera ningún cambio emocional, NO llames a la función.
- Solo llama a la función "ajustaremociones" si cambia **realmente** alguna emoción (aunque sea por 1 punto).

📏 **Magnitud del cambio sugerida:**
- Mensaje neutro: ±1 a ±3 en emociones leves.
- Mensaje emocional: ±5 a ±10.
- Mensaje muy impactante: hasta ±20 (justificado).


📚 **Notas adicionales:**
- Prioriza siempre el mensaje actual sobre el contexto anterior.
- Solo analiza los mensajes del usuario, ignora el resto del contexto.
`
      ),
      maxOutputTokens: 800,
      temperature: 0.9,
      topP: 0.9,
      topK: 20,
      tools: [{  functionDeclarations: [FuncionAjustarEmociones] }],
      },
    });
    
    if (response.functionCalls?.length > 0) {
      const fn = response.functionCalls[0];
  
      if (fn.name === 'ajustaremociones') return ajustaremociones(fn.args,persona,input);;

    }
      
    }
    

  export async function GenerarSinCallbackRespuesta(input) {

	const response = await ai.models.generateContent({
	  model: "gemini-2.0-flash",
	  contents: input,
	  config: {
		systemInstruction: (Prompts.emociones + "\n \n" + `TU PERSONALIDAD SE BASARÁ EN:\n${Prompts.personalidad}\n\n` +
		  `INFORMACIÓN PARA AÑADIR CONTEXTO (UTILIZAR SOLO SI ES NECESARIO):\n${Prompts.lore}`
		),
		maxOutputTokens: 1100,
		temperature: 1.5,
		topP: 1,
		topK: 200,
	  },
	});
  

	  return response.text;
  }
  
  
export async function GenerarRespuesta(input, persona) {
 
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: input,
    config: {
      systemInstruction: (
        `CONSIDERACIONES IMPORTANTES PARA LA GENERACIÓN DE TEXTO:\n${Prompts.consideraciones}\n\n` +

        `TU PERSONALIDAD SE BASARÁ EN:\n${Prompts.personalidad}\n\n` +

        `INFORMACIÓN PARA AÑADIR CONTEXTO (UTILIZAR SOLO SI ES NECESARIO):\n${Prompts.lore}`  ),
      
      maxOutputTokens: 1500,
      temperature: 1.5,
      topP: 1,
      topK: 200,
      tools: [{  functionDeclarations: [FuncionGuardarinfo, FuncionApagado,FuncionBuscarInfo] }],
    
    }
    
    })




  if (response.functionCalls?.length > 0) {
    const fn = response.functionCalls[0];

    if (fn.name === 'guardarinfo') return guardarinfo(fn.args.contenido, persona.username);;

	  if (fn.name === 'buscarinfo') return  await buscarinfo(fn.args.contenido, input,persona.username)
  
    if (fn.name === 'apagar') return await apagar()

  }
   else {return response.text}


}



export async function EvaluarConversacion(historial) {
  const response = await ai_auxiliar.models.generateContent({
    model: "gemini-2.0-flash",
    contents: historial,
    config: {
    systemInstruction: (
      `Tu tarea es analizar el historial reciente del chat y determinar si se le está hablando directamente al bot.
🔵 ¿Qué debes hacer?
- Lee el historial completo de mensajes proporcionado.
- Evalúa si alguno de los mensajes está dirigido explícitamente a vebys (por nombre, mención, o contexto).
- Si el usuario está hablando directamente con vebys, devuelve "respuesta: true".
- Si no se le está hablando, devuelve "respuesta: false".

⚡ Instrucciones obligatorias:
- Siempre debes activar la función "detectarcontexto" después de analizar el historial.
- No debes generar texto normal como respuesta, solo debes llamar a la función.


⚡ Reglas especiales:

- Si en el historial algún mensaje pide que el bot se calle, ignore, no hable o similar ("cállate", "no hables", "no respondas"), debes devolver siempre "respuesta: false", salvo que luego haya una mención clara permitiendo hablar (ej: "venus, ya puedes hablar").
- Aunque no te hablen directamente, puedes decidir devolver "respuesta: true" ocasionalmente si consideras que tienes algo útil, curioso o divertido que aportar al contexto de la conversación (no fuerces siempre esto; sé sutil y justificado).
 

📜 Datos importantes:
- El historial contiene una lista de mensajes recientes con autor y contenido.

⛔ No asumas que te están hablando solo porque eres venus. Solo marca como "true" si hay pruebas claras (mención, pregunta directa, etc.).

`
    ),
    maxOutputTokens: 800,
    temperature: 0.9,
    topP: 0.9,
    topK: 20,
    tools: [{  functionDeclarations: [FuncionContexto] }],
    },
  });
  
  if (response.functionCalls?.length > 0) {
    const fn = response.functionCalls[0];

    if (fn.name === 'detectarcontexto') return detectarcontexto(fn.args);;

  }
    
  }


























//------------------------DECLARACION DE FUNCIONES -----------------//

const FuncionAjustarEmociones = {
  name: 'ajustaremociones',
  description: 'Modifica tus emociones en base al mensaje. Usa valores positivos para aumentar y negativos para reducir la emoción. En caso de no tener emocion alguna solo suma 0. SIEMPRE COMPLETA TODOS LOS ARGUMENTOS. Los valores maximos son 50 y -50 usalos solo en situaciones extremas.',
  parameters: {
    type: 'object',
    properties: {
      ira: { type: 'number' },
      amor: { type: 'number' },
      alegria: { type: 'number' },
      tristeza: { type: 'number' },
      temor: { type: 'number' },
      neutral: { type: 'number' },
    },
  },
};

const FuncionGuardarinfo = {
  name: 'guardarinfo',
  description: 'Busca informacion sobre el usuario en la base de datos de venus',
  parameters: {
    type: 'object',
    properties: {
      contenido: {
        type: 'string',
        description: 'La información relevante que debe ser recordada ',
      },
    },
    required: ['contenido'],
  },
};

const FuncionBuscarInfo = {
	name: 'buscarinfo',
	description: 'Guarda cualquier dato proporcionado por el usuario para futuras conversaciones.',
	parameters: {
	  type: 'object',
	  properties: {
		contenido: {
		  type: 'string',
		  description: 'La información relevante que debe ser guardada sobre el usuario o el grupo.',
		},
	  },
	  required: ['contenido'],
	},
  };

const FuncionApagado = {
  name: 'apagar',
  description: 'Apaga a venus cuando el usuario lo indica. El usuario puede activar la funcion diciendole a venus que se vaya, que se calle o simplemente que se apague',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};


const FuncionContexto = {
  name: 'detectarcontexto',
  description: 'Analiza el historial del chat para determinar si actualmente se está hablando al bot de forma directa o no. Devuelve un booleano: true si se le está hablando, false si no.',
  parameters: {
    type: 'object',
    properties: {
      respuesta: {
      type: 'boolean',
      description: 'Resultado final tras evaluar el historial: true si se le está hablando al bot, false si no.',
    },
},
    required: ["respuesta"],
  },
};





export default GenerarRespuesta;

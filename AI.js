const { GoogleGenAI } = require ('@google/genai')
const dotenv = require('dotenv');
dotenv.config(); 

const ai = new GoogleGenAI({	apiKey: process.env.GEMINI_API_KEY, });
const Prompts = require('./prompts')





function apagar() {
	console.log("APAGANDO A VENUS")
//	modocharla = false;
    return true;
  }



function agradar(puntos){
    console.log("🔴SUMADOS : " + puntos)
}

  











async function GenerarRespuesta(input) {
    const countTokensResponse = await ai.models.countTokens({
        model: "gemini-2.0-flash",
        contents: input,
      });
      console.log(countTokensResponse.totalTokens);



	const response = await ai.models.generateContent({
	  model: "gemini-2.0-flash",
	  contents:input,
	  config: {
        systemInstruction: (
            `CONSIDERACIONES IMPORTANTES PARA LA GENERACIÓN DE TEXTO:\n${Prompts.consideraciones}\n\n` +
            `TU PERSONALIDAD SE BASARÁ EN:\n${Prompts.personalidad}\n\n` +
            `INFORMACIÓN PARA AÑADIR CONTEXTO (UTILIZAR SOLO SI ES NECESARIO):\n${Prompts.lore}`
          ),
		maxOutputTokens: 1100,
		temperature: 1.5,
		topP: 1,
		topK: 200,
		tools:[{
			functionDeclarations:[FuncionAgradar,FuncionApagado]
		  }],
	  },
	});



	if (response.functionCalls?.length > 0) {
		const fn = response.functionCalls[0];
	
		if (fn.name === 'agradar') {
		    agradar(fn.args);
			return null
		}

		if (fn.name === 'apagar') {
			apagar();
		   return null
		  }
	  }else{
		return response.text
	  }

  }











  const FuncionAgradar = {
	name: 'agradar',
	description: 'Cuando el usuario hace o dice algo que agrada al bot, esta función suma puntos de agrado.',
	parameters: {
	  type: 'object',
	  properties: {
		valor: {
		  type: 'number',
		  description: 'La cantidad de agrado que genero al usuario',
		},
	  },
	  required: ['valor'],
	},
  };



  
const FuncionRecordar = {
	name: 'recordar',
	description: 'SIEMPRE que se proporcione un dato sobre el usuario activa esta funcion. Ya sea una curiosidad, dato importante o un simple detalle sobre la persona. (EL DATO DEBE SER PROPORCIONADO POR LA MISMA PERSONA QUE ENVIA EL MENSAJE)',
	parameters: {
	  type: 'object',
	  properties: {
		contenido: {
		  type: 'string',
		  description: 'La información relevante que debe ser recordada sobre el usuario o el grupo.',
		},
	  },
	  required: ['contenido'],
	},
  };
  

  const FuncionApagado = {
	name: 'apagar',
	description: 'Apaga a venus cuando el usuario lo indica',
	parameters: {
	  type: 'object',
	  properties: {  },
	  required: [],
	},
  };
  

  module.exports = GenerarRespuesta;
import { Pinecone } from '@pinecone-database/pinecone'
import { v4 as uuidv4 } from 'uuid';

const pc = new Pinecone({
  apiKey: 'pcsk_6pLfHu_SxyTD67QYRcaeRPEitj3qvMXHeY56KYYHpcxRPT2qte69xgDt6gBGWp1PwHwVjU'
});






export async function BuscarInformacion(params) {
    console.log("SE ACTIVO LA FUNCION BUSCAR")
const namespace = pc.index("example-index", "https://example-index-jp9c0bh.svc.aped-4627-b74a.pinecone.io").namespace("example-namespace");

const response = await namespace.searchRecords({
  query: {
    topK: 1,
    inputs: { text: params},
  },
  fields: ['chunk_text'],
});

return `Informacion en base de datos: { ${response.result.hits[0].fields.chunk_text}}`
}



 export async function GuardarInformacion(informacion,autor){
     const id = `rec-${uuidv4()}`
    console.log("SE ACTIVO LA FUNCION GUARDAR")
  const namespace = pc.index("example-index", "https://example-index-jp9c0bh.svc.aped-4627-b74a.pinecone.io").namespace("example-namespace");
 // let palabra = "todas re mil putas"
  await namespace.upsertRecords([
    {
        "_id": id,
        "chunk_text": informacion,
        "category": "Informacion sobre: " + autor, 
    },

]);

}
  


import { SerialPort } from 'serialport';
import { Correctivo } from './discord';
const port = new SerialPort({
  path: 'COM5',  // Cambia esto al puerto correcto
  baudRate: 9600,
});

port.on('open', () => {
  console.log('Puerto abierto');
});

port.on('data', async (data) => {
 await Correctivo()   
});

port.on('error', (err) => {
  console.error('Error en el puerto serial:', err.message);
});

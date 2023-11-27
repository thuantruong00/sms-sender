var express = require('express');
var router = express.Router();
// const { SerialPort } = require('serialport');
// const { Readline } = require('@serialport/parser-readline');
// const { autoDetect } = require('@serialport/bindings-cpp')



// const portName = 'COM9';


// const port = new SerialPort({
//   path: portName,
//   baudRate: 115200,
// })


router.get('/', async function (req, res, next) {
  console.log("q:",req.query['q'])
  // let list = await SerialPort.list()
  // console.log(list)
  // let response = await port.write("AT+CMGS=1\r\n");


  

      // // Send AT command to set SMS text mode
      // port.write('AT+CMGF=1\r\n');

      // // Wait for a moment before sending the actual SMS
      // setTimeout(() => {
      //     // Send SMS command, replace '123456789' with the recipient's number
      //     port.write('AT+CMGS="+84559924941"\r\n');
  
      //     // Wait for the module to respond with '>'
      //     setTimeout(() => {
      //         // Send the SMS text, replace 'Hello, World!' with your message
      //         port.write('loooooo\x1A');
      //     }, 1000);
      // }, 1000);





  res.send('index');
});



  // port.on('data', function (data) {
  //   console.log(data)
  //   try {
  //     const receivedBuffer = Buffer.from(data, 'hex');
  //     const decodedString = receivedBuffer.toString('ascii');
  //     console.log('Data:', decodedString)
  //   } catch (error) {
      
  //   }
  // })

module.exports = router;

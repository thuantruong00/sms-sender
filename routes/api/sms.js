var express = require('express');
var router = express.Router();
const smsEmitter = require('../../services/smsEmitter');
const status = require("../../services/status")

router.post('/send-one', async function (req, res, next) {
    let action = await smsEmitter.sendMessage(req.body);
    let result = {...status.getStatus("1007"), payload: { status: true }}
    // console.log(result)
    res.send(result);
});

// router.post('/check-signal', async function (req, res, next) {
//     // let response = await smsEmitter.test()
//     // console.log(response)
//     let response = await smsEmitter.getResponse()
//     // let result = {...status.getStatus(),...{payload:[]}}
//     let result = {...status.getStatus(),...{}}
//     res.send('result');

// });

module.exports = router;

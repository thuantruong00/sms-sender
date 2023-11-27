var express = require('express');
var router = express.Router();
const smsEmitter = require('../../services/smsEmitter');
const status = require("../../services/status")


router.get('/detail', async function (req, res, next) {
    await smsEmitter.getInfo();
    let response = await smsEmitter.delayGetInfo();
    // console.log(response)
    // let result = {...status.getStatus(),...{}};
    res.send(response);
});
router.get('/scan-port', async function (req, res, next) {
    let response = await smsEmitter.scanPort();

    // console.log(response)
    res.send(response);
});

module.exports = router;
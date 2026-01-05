const Service = require("node-windows").Service;
const svc = new Service({
    name:"smsService",
    description:"sms service",
    script:"D:\\nodejs\\sms-project\\app.js"
});
svc.on('install', function(){
    svc.start();
})
svc.install();
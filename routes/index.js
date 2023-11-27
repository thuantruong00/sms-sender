const smsApi = require('./api/sms');
const infoApi = require('./api/info');
// const indexApi = require('./api/index');




function routes(app) {
	app.use('/api/sms', smsApi);
	app.use('/api/info', infoApi);
	// app.use('/api/index', indexApi);

}

module.exports.routes = routes;
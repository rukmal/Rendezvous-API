function Routes (app) {
	app.get('/', function (req, res) {
		res.send('hello world');
	});
}

module.exports = Routes;
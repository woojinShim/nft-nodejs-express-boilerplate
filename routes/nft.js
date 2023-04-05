var Response = require('../common/Response');
var ElapsedTimer = require('../common/ElapsedTimer');


var util = require('util');

var SvcNft = require('../services/SvcNft');

module.exports = function (app) {

	/** Mint Nft */
	app.post('/v1/mintNft', function (req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		let cmd = '/v1/mintNft';
		_logger.debug(`POST == ${cmd}`);

		var t = new ElapsedTimer();

		_logger.debug(util.inspect(req.body));

		let svc = new SvcNft(cmd, req.body, req, res, t)
		svc.mintNft();

	})
 
	/** Sell Nft */
	app.post('/v1/sellNft', function (req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		let cmd = '/v1/sellNft';
		_logger.debug(`POST == ${cmd}`);

		var t = new ElapsedTimer();

		_logger.debug(util.inspect(req.body));

		let svc = new SvcNft(cmd, req.body, req, res, t)
		svc.sellNft();
	})

	/** Buy Nft */
  app.post('/v1/buyNft', function (req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		let cmd = '/v1/buyNft';
		_logger.debug(`POST == ${cmd}`);

		var t = new ElapsedTimer();

		_logger.debug(util.inspect(req.body));

		let svc = new SvcNft(cmd, req.body, req, res, t)
		svc.buyNft();
	})

	/** Cancel Sell Nft */
	app.post('/v1/cancelSale', function (req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		let cmd = '/v1/cancelSale';
		_logger.debug(`POST == ${cmd}`);

		var t = new ElapsedTimer();

		_logger.debug(util.inspect(req.body));

		let svc = new SvcNft(cmd, req.body, req, res, t)
		svc.cancelSale();
	})

};

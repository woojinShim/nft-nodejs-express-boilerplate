var Response = require('../common/Response');
var ElapsedTimer = require('../common/ElapsedTimer');

var util = require('util');

var JwtAuth = require('../common/JwtAuth').checkToken;
var SvcCommon = require('../services/SvcCommon');
var SvcList = require('../services/SvcList');

module.exports = function (app) {
	/*
	test api
	*/
	app.post('/v1/test', function (req, res) {
		let cmd = '/v1/test';
		_logger.debug(`POST == ${cmd}`);
		
		var t = new ElapsedTimer();

		_logger.debug(util.inspect(req.body));

		let svc = new SvcCommon(cmd, req.body, req, res, t);
		svc.v1_test();
	});

	app.get('/v1/nftList', function (req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		let cmd = '/v1/nftList';
		_logger.debug(`GET == ${cmd}`);

		var t = new ElapsedTimer();

		_logger.debug(util.inspect(req.body));

		let svc = new SvcList(cmd, req.body, req, res, t)
		svc.v1_sendSellList()
	})

	app.get('/v1/nftList/:id', function (req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		let cmd = '/v1/nftList/:id';
		_logger.debug(`GET == ${cmd}`);
		console.log('id', req.params.id)
		var t = new ElapsedTimer();

		_logger.debug(util.inspect(req.body));

		let svc = new SvcList(cmd, req.body, req, res, t)
		svc.v1_sendSellById()
	})

	app.get('/v1/auctionList', function (req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		let cmd = '/v1/auctionList';
		_logger.debug(`GET == ${cmd}`);

		var t = new ElapsedTimer();

		_logger.debug(util.inspect(req.body));

		let svc = new SvcList(cmd, req.body, req, res, t)
		svc.v1_sendBidList()
	})

	app.get('/v1/auctionList/:id', function (req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		let cmd = '/v1/auctionList/:id';
		_logger.debug(`GET == ${cmd}`);

		var t = new ElapsedTimer();

		_logger.debug(util.inspect(req.body));

		let svc = new SvcList(cmd, req.body, req, res, t)
		svc.v1_sendBidById()
	})

	/*
	토큰 검사
	*/
	app.all('/api/v1/authcheck', JwtAuth, function (req, res) {
		let cmd = '/api/v1/authcheck';
		_logger.debug(`POST == ${cmd}`);

		var t = new ElapsedTimer();

		_logger.debug(util.inspect(req.body));

		let svc = new SvcCommon(cmd, req.body, req, res, t);
		svc.authcheck();
	});

};

var Response = require('../common/Response');
var Code = require('../common/Code');
var MysqlConn = require('../common/MysqlConn.js');
var _SqlFormat = { language: 'sql', indent: '  ' };

class SvcCommon {
	constructor(cmd, body, req, res, t) {
		(this._cmd = cmd), (this._body = body);
		this._req = req;
		this._res = res;
		this._t = t;
	}

	async v1_test() {
		let resdata = {};
		let code = Code.OK;
		var param = {
			nftContract: this._body.nftContract,
			nftId: this._body.nftId,
		};

		// assign
		var sql = MysqlConn.MAKESQL('repo', 'selectItemSell', param, _SqlFormat);

		let connection = null;
		try {
			connection = await MysqlConn.pool.getConnection(async conn => conn);
			let rs = await connection.query(sql);
			resdata.itemsells = rs[0];
		} catch (err) {
			code = Code.FAILED;
			_logger.error(err.stack);
		} finally {
			try {
				connection.release();
			} catch (err) {}
		}

		this._res.json(new Response(this._cmd, code, resdata, this._t).build());
	}

}

module.exports = SvcCommon;

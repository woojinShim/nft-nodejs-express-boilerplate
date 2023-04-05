var MysqlConn = require('../common/MysqlConn.js');
var _SqlFormat = { language: 'sql', indent: '  ' };

var util = require('util');

class SvcRepo {

    async createItemSell(args) {
		var param = {
            seller: args.seller,
            nftContract: args.nftContractEvent,
            nftId: args.nftIdEvent,
            price: args.price,
		};	
        _logger.debug(util.inspect(param));

        var inssql = MysqlConn.MAKESQL('repo', 'createItemSell', param, _SqlFormat);

		let connection = null;
		try {
			connection = await MysqlConn.pool.getConnection(async conn => conn);
            connection.beginTransaction();

			await connection.query(inssql);
            connection.commit();
		} catch (err) {
            connection.rollback();
			_logger.error(err.stack);
		} finally {
			try {
				connection.release();
			} catch (err) {}
		}
    }

    async updateItemSold(args) {
		var param = {
            buyer: args.buyer,
            nftContract: args.nftContractEvent,
            nftId: args.nftIdEvent,
		};
        _logger.debug(util.inspect(param));
        var updsql = MysqlConn.MAKESQL('repo', 'updateItemSold', param, _SqlFormat);

		let connection = null;
		try {
			connection = await MysqlConn.pool.getConnection(async conn => conn);
            connection.beginTransaction();

			let updrs = await connection.query(updsql);

            connection.commit();
		} catch (err) {
            connection.rollback();
			_logger.error(err.stack);
		} finally {
			try {
				connection.release();
			} catch (err) {}
		}
    }

    async changeSalePriceItemSell(args) {
        let param = {
            nftContract: args.nftContractEvent, 
            nftId: args.nftIdEvent, 
            afterPrice: args.afterPrice
        }
        _logger.debug(util.inspect(param));
        let updsql = MysqlConn.MAKESQL('repo', 'changeSalePriceItemSell', param, _SqlFormat);
        let connection = null;
        try {
            connection = await MysqlConn.pool.getConnection(async conn => conn);
            connection.beginTransaction();

            let updrs = await connection.query(updsql)

            connection.commit();
        } catch (err) {
            connection.rollback();
            _logger.error(err.stack);
        } finally {
            try {
                connection.release();
            } catch (err) {}
        }
    }

    async cancelSaleItemSell(args) {
        let param = {
            nftContract: args.nftContractEvent, 
            nftId: args.nftIdEvent
        }
        _logger.debug(util.inspect(param));
        let delsql = MysqlConn.MAKESQL('repo', 'cancelSaleItemSell', param, _SqlFormat);
        let connection = null;
        try {
            connection = await MysqlConn.pool.getConnection(async conn => conn);
            connection.beginTransaction();
            let delrs = await connection.query(delsql)
            connection.commit();
        } catch (err) {
            connection.rollback();
            _logger.error(err.stack);
        } finally {
            try {
                connection.release();
            } catch (err) {}
        }
    }

    async createItemBid(args) {
        let param = {
            nftContract: args.nftContractEvent, 
            nftId: args.nftIdEvent, 
            seller: args.seller,
            startPrice: args.minPrice, 
            deadline: args.deadline
        }
        _logger.debug(util.inspect(param));
        let inssql = MysqlConn.MAKESQL('repo', 'createItemBid', param, _SqlFormat);
        let connection = null;
        try {
            connection = await MysqlConn.pool.getConnection(async conn => conn);
            connection.beginTransaction();
            let insrs = await connection.query(inssql)
            connection.commit();
        } catch (err) {
            connection.rollback();
            _logger.error(err.stack);
        } finally {
            try {
                connection.release();
            } catch (err) {}
        }
    }

    async bidNftItemBid(args) {
        let param = {
            nftContract: args.nftContractEvent, 
            nftId: args.nftIdEvent,
            bidder: args.bidder, 
            price: args.price
        }
        _logger.debug(util.inspect(param));
        let updsql = MysqlConn.MAKESQL('repo', 'bidNftItemBid', param, _SqlFormat);
        let connection = null;
        try {
            connection = await MysqlConn.pool.getConnection(async conn => conn);
            connection.beginTransaction();
            let updrs = await connection.query(updsql)
            connection.commit();
        } catch (err) {
            connection.rollback();
            _logger.error(err.stack);
        } finally {
            try {
                connection.release();
            } catch (err) {}
        }
    }

    async updateItemBid(args) {
        let param = {
            nftContract: args.nftContractEvent, 
            nftId: args.nftIdEvent,
            bidder: args.bidder, 
            price: args.price
        }
        _logger.debug(util.inspect(param));
        let updsql = MysqlConn.MAKESQL('repo', 'updateItemBid', param, _SqlFormat);
        let connection = null;
        try {
            connection = await MysqlConn.pool.getConnection(async conn => conn);
            connection.beginTransaction();
            let updrs = await connection.query(updsql)
            connection.commit();
        } catch (err) {
            connection.rollback();
            _logger.error(err.stack);
        } finally {
            try {
                connection.release();
            } catch (err) {}
        }
    }
}

module.exports = SvcRepo;

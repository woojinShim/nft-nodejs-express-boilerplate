var Response = require('../common/Response');
var Code = require('../common/Code');
var MysqlConn = require('../common/MysqlConn.js');
var _SqlFormat = { language: 'sql', indent: '  ' };
const util = require("util");
const { ethers } = require("ethers");
var Web3 = require('web3');
const SmartContract = require('../config/smartcotract')
require("dotenv").config();
const AWS = require('aws-sdk');
var axios = require('axios')
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});

const marketAbi = SmartContract.abi.marketABI
const marketAddress = SmartContract.marketAddress
const nftAbi = SmartContract.abi.nftABI
const nftAddress = SmartContract.nftAddress
const provider = new ethers.providers.JsonRpcProvider(process.env.MUMBAI_RPC_URL);
const admin = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const web3 = new Web3(process.env.MUMBAI_RPC_URL)

class SvcNft {
  constructor(cmd, body, req, res, t) {
		(this._cmd = cmd), (this._body = body);
		this._req = req;
		this._res = res;
		this._t = t;
	}

  async mintNft() {
    let resdata = {};
		let code = Code.OK;
		var param = {
      ids: this._body.id,
      minter: this._body.minter,
			name: this._body.name,
      description: this._body.description,
      image: this._body.image,
		};
    let res
    this._res.json(new Response(this._cmd, code, resdata, this._t).build());

    const nft = new ethers.Contract(nftAddress, nftAbi, admin);
    const gasLimit = ((await provider.getBlock('latest')).gasLimit).toString();
    const gasPrice = (await provider.getGasPrice()).toString()
    console.log(gasLimit, gasPrice)
    const quantity = param.ids.length;
    try {
      /** Mint Nft */
      let tx = await nft.mint(param.minter.toString(), quantity.toString(), {gasPrice: gasPrice});
      
      res = tx.hash;
      console.log(res)
      await tx.wait();
      
      let txHash = await provider.getTransaction(res);

      let tokenArr = []
      let tokenInfoList = []

      /** Get Token Number */
      const receipt = await web3.eth.getTransactionReceipt(res)
      let n = receipt.logs.length - 1
      for(let i = 0; i < n; i++) {
        const tokenId = web3.utils.hexToNumber(receipt.logs[i].topics[3])
        tokenArr.push(tokenId);
      }

      _logger.debug(`Transaction Hash ${util.inspect(res)} ${util.inspect(txHash)}`);

      await provider.call({to: await admin.getAddress(), data: txHash.data});
      
      try {
        /** Upload json URL */
        for(let i = 0; i < tokenArr.length; i++) {
          if(param.minter == await nft.ownerOf(tokenArr[i])){
            const JSONData =
            `
            {
              "name": "${param.name}",
              "description": "${param.description}",
              "image": "${param.image}"
            }
            `
            const params = {
              ACL: "public-read",
              Bucket: 'test-market-place-torynft-bc', // market-place-torynft-bc
              Key: `${tokenArr[i]}.json`, 
              Body: JSONData, 
              ContentType: 'application/json'
            };
            s3.upload(params, function (s3Err, data) {
              if (s3Err) throw s3Err
              _logger.debug(`File uploaded successfully at ${data.Location}`);
            })
            
            tokenInfoList.push({id: param.ids[i], tokenId: tokenArr[i]})
          }
        }
        console.log('tokenInfoList',tokenInfoList)
        const res = async () => {
          /** Responese Result Success */
          try {
            await axios
            .post(
              `${process.env.BASE_URL}/mintNft-result`,
              {
                mintNftResult: "SUCCESS",
                tokenInfoList: tokenInfoList
              },
              {
                headers: {
                  "Authorization": `Bearer pvVW8lqViWDvM1lYRFVS5F_IUsn4_mopa0IPVYfklDh57qJjV9jVmBJPX-PabcFI941I2kY2eNl6Eq8NrefiwA${process.env.AXIOS}`
                }
              }
            )
            .then((response) => {
              console.log(response.data)
            })
          } catch (err) {
            console.log(err);
          }
        }
        await res()

      } catch (err) {
        /** Response Result Fail */
        const res = async () => {
          await axios
          .post(
            `${process.env.BASE_URL}/mintNft-result`,
            {
              mintNftResult: "FAIL",
              tokenInfoList: param.ids
            },
            {
              headers: {
                "Authorization": `Bearer pvVW8lqViWDvM1lYRFVS5F_IUsn4_mopa0IPVYfklDh57qJjV9jVmBJPX-PabcFI941I2kY2eNl6Eq8NrefiwA${process.env.AXIOS}`
              }
            }
          )
          .then((response) => {
            console.log(response.data)
          })
        }
        await res()
      }
    } catch (err) {
      const reason = err.error.reason
      const reason2 = err.error.error.reason
      
      console.log(reason)
      /** Response Result Fail */
        await axios
        .post(
          `${process.env.BASE_URL}/mintNft-result`,
          {
            mintNftResult: "FAIL",
            mintNftMsg: reason,
            tokenInfoList: param.ids
          },
          {
            headers: {
              "Authorization": `Bearer pvVW8lqViWDvM1lYRFVS5F_IUsn4_mopa0IPVYfklDh57qJjV9jVmBJPX-PabcFI941I2kY2eNl6Eq8NrefiwA${process.env.AXIOS}`
            }
          }
        )
        .then((response) => {
          console.log(response.data)
        })
    }
  }

  async sellNft() {
    let resdata = {};
		let code = Code.OK;
		var param = {
      salesInfoId: this._body.nftList[0]['salesInfoId'],
      nftHistoryId: this._body.nftList[0]['nftHistoryId'],
      price: this._body.nftList[0]['price'],
      deadline: this._body.nftList[0]['deadline'],
      tokenId: this._body.nftList[0]['tokenId'],
      signature: this._body.nftList[0]['signature'],
      seller: this._body.nftList[0]['seller']
		};
    
    this._res.json(new Response(this._cmd, code, resdata, this._t).build());
    let res, res2;
    
    const nft = new ethers.Contract(nftAddress, nftAbi, admin);
    const gasLimit = ((await provider.getBlock('latest')).gasLimit).toString()
    const gasPrice = (await provider.getGasPrice()).toString()
    console.log(gasLimit)
    try {
      /** Use Permit */
      let tx = await nft
        .permit(await admin.getAddress(), param.tokenId, param.deadline, param.signature, {gasPrice: gasPrice});
      res = tx.hash;
      await tx.wait()

      let txHash = await provider.getTransaction(res);
      await provider.call({to: await admin.getAddress(), data: txHash.data})

      _logger.debug(`ERC-721 ${param.tokenId} Approved for ${await nft.getApproved(param.tokenId)}`);
    
      /** Sell Nft */
      const market = new ethers.Contract(marketAddress, marketAbi, admin)
      let tx2 = await market.sellNft(nftAddress, param.tokenId, param.price, param.seller, {gasPrice: gasPrice})
      res2 = tx2.hash
      await tx2.wait()
      let txHash2 = await provider.getTransaction(res2);

      await provider.call({to: await admin.getAddress(), data: txHash2.data})

      /** Response Result Success */
      await axios
        .post(
          `${process.env.BASE_URL}/sellNft-result`,
          {
            sellNftResult: "SUCCESS",
            signature: param.signature,
            tokenId: param.tokenId,
            price: param.price,
            salesInfoId: param.salesInfoId,
            nftHistoryId: param.nftHistoryId,
            deadline: param.deadline,
            seller: param.seller
          },
          {
            headers: {
              "Authorization": `Bearer pvVW8lqViWDvM1lYRFVS5F_IUsn4_mopa0IPVYfklDh57qJjV9jVmBJPX-PabcFI941I2kY2eNl6Eq8NrefiwA${process.env.AXIOS}`
            }
          }
        )
        .then((response) => {
          console.log(response.data)
        })
      
      } catch (err) {
        /** tx Error Msg */
        let txHash = await provider.getTransaction(res);
        const response = await provider.call(
          {
              to: txHash.to,
              from: txHash.from,
              nonce: txHash.nonce,
              gasLimit: txHash.gasLimit,
              gasPrice: txHash.gasPrice,
              data: txHash.data,
              value: txHash.value,
              chainId: txHash.chainId,
              type: txHash.type ?? undefined,
              accessList: txHash.accessList,
          },
          txHash.blockNumber
      );
  
      let reason = ethers.utils.toUtf8String("0x" + response.substring(138));
      console.log(reason);

      /** Response Result Fail */
      await axios
        .post(
          `${process.env.BASE_URL}/sellNft-result`,
          {
            sellNftResult: "FAIL",
            sellNftMsg: reason,
            signature: param.signature,
            tokenId: param.tokenId,
            price: param.price,
            salesInfoId: param.salesInfoId,
            nftHistoryId: param.nftHistoryId,
            deadline: param.deadline,
            seller: param.seller
          },
          {
            headers: {
              "Authorization": `Bearer pvVW8lqViWDvM1lYRFVS5F_IUsn4_mopa0IPVYfklDh57qJjV9jVmBJPX-PabcFI941I2kY2eNl6Eq8NrefiwA${process.env.AXIOS}`
            }
          }
        )
        .then((response) => {
          console.log(response.data)
        })
      }
  }

  async buyNft() {
    let resdata = {};
		let code = Code.OK;
    var param = {
      nftPayInfoId: this._body.nftPayInfoId,
      tokenId: this._body.tokenId,
      salesInfoHistoryId: this._body.salesInfoHistoryId,
      salesInfoId: this._body.salesInfoId,
      mintingInfoId: this._body.mintingInfoId,
      memberIdSeller: this._body.memberIdSeller,
      memberIdBuyer: this._body.memberIdBuyer,
      buyer: this._body.buyer,
      seller: this._body.seller
		};
    this._res.json(new Response(this._cmd, code, resdata, this._t).build());

    const gasLimit = ((await provider.getBlock('latest')).gasLimit).toString()
    const gasPrice = (await provider.getGasPrice()).toString()

    try {
      const nft = new ethers.Contract(nftAddress, nftAbi, admin);
      /** Transfer to Buyer */
      let tx = await nft.transferFrom(param.seller, param.buyer, param.tokenId, {gasPrice: gasPrice})
      let res = tx.hash
      console.log(res)
      await tx.wait()
      let txHash = await provider.getTransaction(res);
      await provider.call({to: await admin.getAddress(), data: txHash.data})
      
      console.log(txHash)
      /** Response Result Success */
      await axios
      .post(
        `${process.env.BASE_URL}/buyNft-result`,
        {
          buyNftResult: "SUCCESS",
          tokenId: param.tokenId,
          nftPayInfoId: param.nftPayInfoId,
          salesInfoHistoryId: param.salesInfoHistoryId,
          salesInfoId: param.salesInfoId,
          mintingInfoId: param.mintingInfoId,
          memberIdSeller: param.memberIdSeller,
          seller: param.seller,
          memberIdBuyer: param.memberIdBuyer,
          buyer: param.buyer
        },
        {
          headers: {
            "Authorization": `Bearer pvVW8lqViWDvM1lYRFVS5F_IUsn4_mopa0IPVYfklDh57qJjV9jVmBJPX-PabcFI941I2kY2eNl6Eq8NrefiwA${process.env.AXIOS}`
          }
        }
      )
      .then((response) => {
        console.log(response.data)
      })

    } catch (err) {
      console.log(err)
    }
  }

  async cancelSale() {
    let resdata = {};
		let code = Code.OK;
    var param = {
      cancelSaleList: this._body.cancelSaleList,
    }
    this._res.json(new Response(this._cmd, code, resdata, this._t).build());
    
    let cancelSaleListResult =[]
    let res
    const gasLimit = ((await provider.getBlock('latest')).gasLimit).toString()
    const gasPrice = (await provider.getGasPrice()).toString()
    console.log(gasLimit)
    try {
      const market = new ethers.Contract(marketAddress, marketAbi, admin)
      /** Cancel Sell Nft */
      for(let l = 0; l < param.cancelSaleList.length; l++) {
        let tx = await market.cancelSale(nftAddress, param.cancelSaleList[l]['tokenId'], {gasPrice: gasPrice})
        res = tx.hash
        console.log(res)
        await tx.wait()
        let txHash = await provider.getTransaction(res);
        await provider.call({to: await admin.getAddress(), data: txHash.data})
        cancelSaleListResult.push({tokenId: param.cancelSaleList[l]['tokenId'], salesInfoId: param.cancelSaleList[l]['salesInfoId']})
      }

      /** Response Result Success */
      await axios
      .post(
        `${process.env.BASE_URL}/cancelSale-result`,
        {
          cancelSaleResult: "SUCCESS",
          cancelSaleList: cancelSaleListResult
        },
        {
          headers: {
            "Authorization": `Bearer pvVW8lqViWDvM1lYRFVS5F_IUsn4_mopa0IPVYfklDh57qJjV9jVmBJPX-PabcFI941I2kY2eNl6Eq8NrefiwA${process.env.AXIOS}`
          }
        }
      )
      .then((response) => {
        console.log(response.data)
      })

    } catch (err) { 
        /** tx Error Msg */
        let txHash = await provider.getTransaction(res);
        const response = await provider.call(
          {
              to: txHash.to,
              from: txHash.from,
              nonce: txHash.nonce,
              gasLimit: txHash.gasLimit,
              gasPrice: txHash.gasPrice,
              data: txHash.data,
              value: txHash.value,
              chainId: txHash.chainId,
              type: txHash.type ?? undefined,
              accessList: txHash.accessList,
          },
          txHash.blockNumber
      );

      let reason = ethers.utils.toUtf8String("0x" + response.substring(138));
      console.log(reason);

      /** Response Result Cancel Sell Nft Fail */
      await axios
      .post(
        `${process.env.BASE_URL}/cancelSale-result`,
        {
          cancelSaleResult: "FAIL",
          cancelSaleMsg: reason
        },
        {
          headers: {
            "Authorization": `Bearer pvVW8lqViWDvM1lYRFVS5F_IUsn4_mopa0IPVYfklDh57qJjV9jVmBJPX-PabcFI941I2kY2eNl6Eq8NrefiwA${process.env.AXIOS}`
          }
        }
      )
      .then((response) => {
        console.log(response.data)
      })
      console.log(err)
    }
  }
}

module.exports = SvcNft
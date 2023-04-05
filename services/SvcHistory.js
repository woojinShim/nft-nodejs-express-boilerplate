
const { Alchemy, Network, fromHex } = require("alchemy-sdk")
require("dotenv").config();
const SmartContract = require('../config/smartcotract')
const nftAddress = SmartContract.nftAddress

const config = {
  apiKey: process.env.MUMBAI_API_KEY,
  network: Network.MATIC_MUMBAI,
};
const alchemy = new Alchemy(config);

/** Get Transfer History */
const main = async () => {
  // Contract address
  const address = [nftAddress];
  // Get all NFTs
  const response = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    contractAddresses: address,
    category: ["erc721"],
    excludeZeroValue: false,
  });

  // Set NFT ID
  const nftId = 14;

  // Get transactions for the NFT
  let txns = response.transfers.filter(
    (txn) => fromHex(txn.erc721TokenId) === nftId
  );
  txns.map((item) => console.log(item.from, '=>', item.to));
  };

  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();
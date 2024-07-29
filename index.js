const { Client, PrivateKey, AccountBalanceQuery, Hbar, TokenCreateTransaction, TokenType, TokenSupplyType } = require('@hashgraph/sdk');
require('dotenv').config();


const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;

async function createHederaClient() {

  if (!myAccountId || !myPrivateKey) {
    throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
  }else{
    console.log("We're ready to go")
  }

  const client = Client.forTestnet();
  client.setOperator(myAccountId, myPrivateKey);
  client.setDefaultMaxTransactionFee(new Hbar(100));
  client.setMaxQueryPayment(new Hbar(50));

  return client;
}

async function checkAccountBalance(client) {
  const accountBalance = await new AccountBalanceQuery()
    .setAccountId(myAccountId)
    .execute(client);
  console.log("The new account balance is: " + accountBalance.hbars.toTinybars() + " tinybar.");
}

async function createToken(client) {
  const supplyKey = PrivateKey.generate();
  const treasuryKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

  const tokenCreateTx = await new TokenCreateTransaction()
    .setTokenName("Nosen Token")
    .setTokenSymbol("NNT")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(10000)
    .setTreasuryAccountId(client.operatorAccountId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(supplyKey)
    .freezeWith(client);

  const tokenCreateTxSigned = await tokenCreateTx.sign(treasuryKey);
  const tokenCreateSubmit = await tokenCreateTxSigned.execute(client);
  const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
  const tokenId = tokenCreateRx.tokenId;

  console.log(`- Created token with ID: ${tokenId} \n`);
}

async function main() {
  try {

    const client = await createHederaClient();
    await checkAccountBalance(client);
    await createToken(client);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();

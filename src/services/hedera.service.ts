import {
  AccountId,
  AccountBalanceQuery,
  AccountCreateTransaction,
  AccountDeleteTransaction,
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TokenCreateTransaction,
  Hbar,
  PrivateKey,
  TransferTransaction,
  TokenMintTransaction,
  TokenSupplyType,
  TokenType,
} from '@hashgraph/sdk';

class HederaService {
  private client = this.getClient();

  private async getClient() {
    let client: Client;
    try {
      client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
        AccountId.fromString(process.env.OPERATOR_ID),
        PrivateKey.fromString(process.env.OPERATOR_KEY),
      );
    } catch (error) {
      throw new Error('Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required.');
    }
    return client;
  }

  public async getAccountBalance(accountId: string) {
    const client = await this.client;
    const balance = await new AccountBalanceQuery().setAccountId(accountId).execute(client);
    console.log(`- ${accountId.toString()} balance = ${balance.hbars.toString()} \n`);
    return {
      accountId: accountId.toString(),
      balance: balance.hbars.toString(),
    };
  }

  public async createAccount() {
    const client = await this.client;
    const newKey = PrivateKey.generate();
    console.log(`- Private key = ${newKey.toString()}`);
    console.log(`- Public key = ${newKey.publicKey.toString()}`);
    const response = await new AccountCreateTransaction().setInitialBalance(new Hbar(10)).setKey(newKey.publicKey).execute(client);
    const receipt = await response.getReceipt(client);
    console.log(`- Account ID = ${receipt.accountId.toString()} \n`);
    return {
      accountId: receipt.accountId.toString(),
      publicKey: newKey.publicKey.toString(),
      privateKey: newKey.toString(),
    };
  }

  public async createNft(treasuryId: string, tokenName: string, tokenSymbol: string) {
    const client = await this.client;
    const supplyKey = PrivateKey.generateED25519();
    const treasuryKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    const CID = 'QmTzWcVfk88JRqjTpVwHzBeULRTNzHY7mnBSG42CpwHmPa';
    const nftCreate = await new TokenCreateTransaction()
      .setTokenName(tokenName)
      .setTokenSymbol(tokenSymbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(250)
      .setSupplyKey(supplyKey)
      .freezeWith(client);
    const nftCreateTxSign = await nftCreate.sign(treasuryKey);
    const nftCreateSubmit = await nftCreateTxSign.execute(client);
    const nftCreateRx = await nftCreateSubmit.getReceipt(client);
    const tokenId = await nftCreateRx.tokenId;
    this.mintNft(client, supplyKey, tokenId, CID);
    console.log(`- Created NFT with token ID: ${tokenId.toString()} \n`);
    return {
      supplyKey: supplyKey.toString(),
      tokenId: tokenId.toString(),
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
    };
  }

  public async createTopic(message: string) {
    const client = await this.client;
    const createResponse = await new TopicCreateTransaction().execute(client);
    const createReceipt = await createResponse.getReceipt(client);
    console.log(`- Topic ID = ${createReceipt.topicId.toString()}`);
    const sendResponse = await new TopicMessageSubmitTransaction({
      topicId: createReceipt.topicId,
      message: message,
    }).execute(client);
    const sendReceipt = await sendResponse.getReceipt(client);
    console.log(`- Topic sequence number = ${sendReceipt.topicSequenceNumber.toString()} \n`);
    return {
      message: message,
      topicId: createReceipt.topicId.toString(),
      sequenceNumber: sendReceipt.topicSequenceNumber.toString(),
    };
  }

  public async deleteAccount() {
    const client = await this.client;
    const newKey = PrivateKey.generate();
    console.log(`- Private key = ${newKey.toString()}`);
    console.log(`- Public key = ${newKey.publicKey.toString()}`);
    const response = await new AccountCreateTransaction().setInitialBalance(new Hbar(10)).setKey(newKey.publicKey).execute(client);
    const receipt = await response.getReceipt(client);
    console.log(`- Created account ID = ${receipt.accountId.toString()}`);
    const transaction = new AccountDeleteTransaction()
      .setNodeAccountIds([response.nodeId])
      .setAccountId(receipt.accountId)
      .setTransferAccountId(client.operatorAccountId)
      .freezeWith(client);
    newKey.signTransaction(transaction);
    await transaction.execute(client);
    console.log(`- Deleted account ID = ${receipt.accountId.toString()} \n`);
    return {
      accountId: receipt.accountId.toString(),
    };
  }

  private async mintNft(client: Client, supplyKey: any, tokenId: any, CID: string) {
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([Buffer.from(CID)])
      .freezeWith(client);
    const mintTxSign = await mintTx.sign(supplyKey);
    const mintTxSubmit = await mintTxSign.execute(client);
    const mintRx = await mintTxSubmit.getReceipt(client);
    return mintRx;
  }

  public async transferHbar(accountId: string) {
    const client = await this.client;
    const transferAmount = 10;
    const newAccountPrivateKey = await PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;
    const newAccountTransactionResponse = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(Hbar.fromTinybars(1000))
      .execute(client);
    const getReceipt = await newAccountTransactionResponse.getReceipt(client);
    const newAccountId = getReceipt.accountId;
    console.log(`- The new account ID is: ${newAccountId}`);
    const accountBalance = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
    console.log(`- The new account balance is: ${accountBalance.hbars.toTinybars()} tinybar`);
    const sendHbar = await new TransferTransaction()
      .addHbarTransfer(accountId, Hbar.fromTinybars(-transferAmount))
      .addHbarTransfer(newAccountId, Hbar.fromTinybars(transferAmount))
      .execute(client);
    const transactionReceipt = await sendHbar.getReceipt(client);
    console.log(`- The transfer transaction from my account to the new account was: ${transactionReceipt.status.toString()}`);
    const queryCost = await new AccountBalanceQuery().setAccountId(newAccountId).getCost(client);
    console.log(`- The cost of query is: ${queryCost}`);
    const getNewBalance = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
    console.log(`- The account balance after the transfer is: ${getNewBalance.hbars.toTinybars()} tinybar \n`);
    return {
      accountId: newAccountId.toString(),
      balance: getNewBalance.hbars.toString(),
      queryCost: queryCost._valueInTinybar,
      transferAmount: transferAmount,
    };
  }
}

export default HederaService;

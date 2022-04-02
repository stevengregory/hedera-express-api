import {
  AccountId,
  AccountBalanceQuery,
  AccountCreateTransaction,
  AccountDeleteTransaction,
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  Hbar,
  PrivateKey,
  TransferTransaction,
} from '@hashgraph/sdk';

class HederaService {
  public client = this.getClient();

  public async getClient() {
    let client;
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
    console.log(`${accountId.toString()} balance = ${balance.hbars.toString()}`);
    return {
      accountId: accountId.toString(),
      balance: balance.hbars.toString(),
    };
  }

  public async createAccount() {
    const client = await this.client;
    const newKey = PrivateKey.generate();
    console.log(`private key = ${newKey.toString()}`);
    console.log(`public key = ${newKey.publicKey.toString()}`);
    const response = await new AccountCreateTransaction().setInitialBalance(new Hbar(10)).setKey(newKey.publicKey).execute(client);
    const receipt = await response.getReceipt(client);
    console.log(`account id = ${receipt.accountId.toString()}`);
    return {
      accountId: receipt.accountId.toString(),
      publicKey: newKey.publicKey.toString(),
      privateKey: newKey.toString(),
    };
  }

  public async createTopic(message: string) {
    const client = await this.client;
    const createResponse = await new TopicCreateTransaction().execute(client);
    const createReceipt = await createResponse.getReceipt(client);
    console.log(`topic id = ${createReceipt.topicId.toString()}`);
    const sendResponse = await new TopicMessageSubmitTransaction({
      topicId: createReceipt.topicId,
      message: message,
    }).execute(client);
    const sendReceipt = await sendResponse.getReceipt(client);
    console.log(`topic sequence number = ${sendReceipt.topicSequenceNumber.toString()}`);
    return {
      message: message,
      topicId: createReceipt.topicId.toString(),
      sequenceNumber: sendReceipt.topicSequenceNumber.toString(),
    };
  }

  public async deleteAccount() {
    const client = await this.client;
    const newKey = PrivateKey.generate();
    console.log(`private key = ${newKey.toString()}`);
    console.log(`public key = ${newKey.publicKey.toString()}`);
    const response = await new AccountCreateTransaction().setInitialBalance(new Hbar(10)).setKey(newKey.publicKey).execute(client);
    const receipt = await response.getReceipt(client);
    console.log(`created account id = ${receipt.accountId.toString()}`);
    const transaction = new AccountDeleteTransaction()
      .setNodeAccountIds([response.nodeId])
      .setAccountId(receipt.accountId)
      .setTransferAccountId(client.operatorAccountId)
      .freezeWith(client);
    newKey.signTransaction(transaction);
    await transaction.execute(client);
    console.log(`deleted account id = ${receipt.accountId.toString()}`);
    return {
      accountId: receipt.accountId.toString(),
    };
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
    console.log(`The new account ID is: ${newAccountId}`);
    const accountBalance = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
    console.log(`The new account balance is: ${accountBalance.hbars.toTinybars()} tinybar.`);
    const sendHbar = await new TransferTransaction()
      .addHbarTransfer(accountId, Hbar.fromTinybars(-transferAmount))
      .addHbarTransfer(newAccountId, Hbar.fromTinybars(transferAmount))
      .execute(client);
    const transactionReceipt = await sendHbar.getReceipt(client);
    console.log(`The transfer transaction from my account to the new account was: ${transactionReceipt.status.toString()}`);
    const queryCost = await new AccountBalanceQuery().setAccountId(newAccountId).getCost(client);
    console.log(`The cost of query is: ${queryCost}`);
    const getNewBalance = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
    console.log(`The account balance after the transfer is: ${getNewBalance.hbars.toTinybars()} tinybar.`);
    return {
      accountId: newAccountId.toString(),
      balance: getNewBalance.hbars.toString(),
      queryCost: queryCost._valueInTinybar,
      transferAmount: transferAmount,
    };
  }
}

export default HederaService;

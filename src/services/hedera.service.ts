import { AccountId, AccountBalanceQuery, AccountCreateTransaction, Client, Hbar, PrivateKey, TransferTransaction } from '@hashgraph/sdk';

class HederaService {
  public client = this.getClient();

  public getClient() {
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

  public async getAccountBalance(accountId) {
    const balance = await new AccountBalanceQuery().setAccountId(accountId).execute(this.client);
    console.log(`${accountId.toString()} balance = ${balance.hbars.toString()}`);
    return {
      accountId: accountId.toString(),
      balance: balance.hbars.toString(),
    };
  }

  public async createAccount() {
    const newKey = PrivateKey.generate();
    console.log(`private key = ${newKey.toString()}`);
    console.log(`public key = ${newKey.publicKey.toString()}`);
    const response = await new AccountCreateTransaction().setInitialBalance(new Hbar(10)).setKey(newKey.publicKey).execute(this.client);
    const receipt = await response.getReceipt(this.client);
    console.log(`account id = ${receipt.accountId.toString()}`);
    return {
      accountId: receipt.accountId.toString(),
      publicKey: newKey.publicKey.toString(),
      privateKey: newKey.toString(),
    };
  }

  public async transferHbar(accountId) {
    const transferAmount = 10;
    const newAccountPrivateKey = await PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;
    const newAccountTransactionResponse = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(Hbar.fromTinybars(1000))
      .execute(this.client);
    const getReceipt = await newAccountTransactionResponse.getReceipt(this.client);
    const newAccountId = getReceipt.accountId;
    console.log(`The new account ID is: ${newAccountId}`);
    const accountBalance = await new AccountBalanceQuery().setAccountId(newAccountId).execute(this.client);
    console.log(`The new account balance is: ${accountBalance.hbars.toTinybars()} tinybar.`);
    const sendHbar = await new TransferTransaction()
      .addHbarTransfer(accountId, Hbar.fromTinybars(-transferAmount))
      .addHbarTransfer(newAccountId, Hbar.fromTinybars(transferAmount))
      .execute(this.client);
    const transactionReceipt = await sendHbar.getReceipt(this.client);
    console.log(`The transfer transaction from my account to the new account was: ${transactionReceipt.status.toString()}`);
    const queryCost = await new AccountBalanceQuery().setAccountId(newAccountId).getCost(this.client);
    console.log(`The cost of query is: ${queryCost}`);
    const getNewBalance = await new AccountBalanceQuery().setAccountId(newAccountId).execute(this.client);
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

import { AccountId, AccountBalanceQuery, Client, PrivateKey } from '@hashgraph/sdk';

class HederaService {
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
    const balance = await new AccountBalanceQuery().setAccountId(accountId).execute(this.getClient());
    console.log(`${accountId.toString()} balance = ${balance.hbars.toString()}`);
    return balance;
  }
}

export default HederaService;

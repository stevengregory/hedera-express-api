import { NextFunction, Request, Response } from 'express';
import { Client, AccountBalanceQuery, AccountCreateTransaction, Hbar, PrivateKey, AccountId } from '@hashgraph/sdk';

class AccountController {
  private getClient() {
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

  public getAccountBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const client = this.getClient();
      const accountId = req.params.accountId;
      const balance = await new AccountBalanceQuery().setAccountId(accountId).execute(client);
      console.log(`${accountId.toString()} balance = ${balance.hbars.toString()}`);
      res.status(200).json({ data: balance, message: 'getAccountBalance' });
    } catch (error) {
      next(error);
    }
  };

  public createAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const client = this.getClient();
      const newKey = PrivateKey.generate();
      console.log(`private key = ${newKey.toString()}`);
      console.log(`public key = ${newKey.publicKey.toString()}`);
      const response = await new AccountCreateTransaction().setInitialBalance(new Hbar(10)).setKey(newKey.publicKey).execute(client);
      const receipt = await response.getReceipt(client);
      console.log(`account id = ${receipt.accountId.toString()}`);
      res.status(200).json({ data: receipt, message: 'createAccount' });
    } catch (error) {
      next(error);
    }
  };
}

export default AccountController;

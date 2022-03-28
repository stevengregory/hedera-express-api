import { NextFunction, Request, Response } from 'express';
import { AccountBalanceQuery, AccountCreateTransaction, AccountId, Client, Hbar, PrivateKey, TransferTransaction } from '@hashgraph/sdk';

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
      res.status(200).json({
        data: { accountId: accountId.toString(), balance: balance.hbars.toString() },
        message: 'getAccountBalance',
      });
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
      res.status(200).json({
        data: { accountId: receipt.accountId.toString(), publicKey: newKey.publicKey.toString(), privateKey: newKey.toString() },
        message: 'createAccount',
      });
    } catch (error) {
      next(error);
    }
  };

  public transferHbar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const client = this.getClient();
      const accountId = req.params.accountId;
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
      res.status(200).json({
        data: {
          accountId: newAccountId.toString(),
          balance: getNewBalance.hbars.toString(),
          queryCost: queryCost._valueInTinybar,
          transferAmount: transferAmount,
        },
        message: 'transferHbar',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AccountController;

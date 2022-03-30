import { NextFunction, Request, Response } from 'express';
import HederaService from '@services/hedera.service';

class AccountController {
  private hederaService = new HederaService();

  public getAccountBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accountId: string = req.params.accountId;
      const data = await this.hederaService.getAccountBalance(accountId);
      res.status(200).json({
        data: data,
        message: 'getAccountBalance',
      });
    } catch (error) {
      next(error);
    }
  };

  public createAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.hederaService.createAccount();
      res.status(200).json({
        data: data,
        message: 'createAccount',
      });
    } catch (error) {
      next(error);
    }
  };

  public transferHbar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accountId: string = req.params.accountId;
      const data = await this.hederaService.transferHbar(accountId);
      res.status(200).json({
        data: data,
        message: 'transferHbar',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AccountController;

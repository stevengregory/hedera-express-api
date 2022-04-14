import { Router } from 'express';
import AccountController from '@controllers/account.controller';
import { Routes } from '@interfaces/routes.interface';

class AccountRoute implements Routes {
  public path = '/account';
  public router = Router();
  public accountController = new AccountController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:accountId`, this.accountController.getAccountBalance);
    this.router.post(`${this.path}`, this.accountController.createAccount);
    this.router.post(`${this.path}/:accountId`, this.accountController.transferHbar);
    this.router.delete(`${this.path}`, this.accountController.deleteAccount);
  }
}

export default AccountRoute;

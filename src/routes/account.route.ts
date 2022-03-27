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
  }
}

export default AccountRoute;

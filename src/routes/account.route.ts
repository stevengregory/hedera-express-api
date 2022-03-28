import { Router } from 'express';
import AccountController from '@controllers/account.controller';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';

class AccountRoute implements Routes {
  public path = '/account';
  public router = Router();
  public accountController = new AccountController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:accountId`, this.accountController.getAccountBalance);
    this.router.post(`${this.path}`, validationMiddleware(null, 'body'), this.accountController.createAccount);
    this.router.post(`${this.path}/:accountId`, validationMiddleware(null, 'body'), this.accountController.transferHbar);
  }
}

export default AccountRoute;

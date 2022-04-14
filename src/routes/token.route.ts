import { Router } from 'express';
import TokenController from '@controllers/token.controller';
import { Routes } from '@interfaces/routes.interface';

class TokenRoute implements Routes {
  public path = '/token';
  public router = Router();
  public tokenController = new TokenController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, this.tokenController.nftCreate);
  }
}

export default TokenRoute;

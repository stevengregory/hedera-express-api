import { NextFunction, Request, Response } from 'express';
import HederaService from '@services/hedera.service';

class TokenController {
  private hederaService = new HederaService();

  public nftCreate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accountId: string = req.body.accountId;
      const tokenName: string = req.body.tokenName;
      const tokenSymbol: string = req.body.tokenSymbol;
      const data = await this.hederaService.createNft(accountId, tokenName, tokenSymbol);
      res.status(200).json({
        data: data,
        message: 'nftCreate',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TokenController;

import { NextFunction, Request, Response } from 'express';
import HederaService from '@services/hedera.service';

class TopicController {
  private hederaService = new HederaService();

  public createTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const message: string = req.params.message;
      const data = await this.hederaService.createTopic(message);
      res.status(200).json({
        data: data,
        message: 'createTopic',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TopicController;

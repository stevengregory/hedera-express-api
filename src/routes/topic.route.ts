import { Router } from 'express';
import TopicController from '@controllers/topic.controller';
import { Routes } from '@interfaces/routes.interface';

class TopicRoute implements Routes {
  public path = '/topic';
  public router = Router();
  public topicController = new TopicController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/:message`, this.topicController.createTopic);
  }
}

export default TopicRoute;

import request from 'supertest';
import App from '@/app';
import TokenRoute from '@routes/token.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Tokens', () => {
  describe('[POST] /token', () => {
    it('response statusCode 200 / createNft', () => {
      const nftData = {
        accountId: '0.0.33958084',
        tokenName: 'Darth Vader Coin',
        tokenSymbol: 'DVC',
      };
      const tokenRoute = new TokenRoute();
      const app = new App([tokenRoute]);

      return request(app.getServer()).post(`${tokenRoute.path}`).send(nftData).expect(200);
    });
  });
});

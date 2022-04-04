import request from 'supertest';
import App from '@/app';
import AccountRoute from '@routes/account.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Accounts', () => {
  describe('[GET] /account/:accountId', () => {
    it('response statusCode 200 / getAccountBalance', () => {
      const accountId = '0.0.33958084';
      const accountRoute = new AccountRoute();
      const app = new App([accountRoute]);

      return request(app.getServer()).get(`${accountRoute.path}/${accountId}`).expect(200);
    });
  });
});

import App from '@/app';
import IndexRoute from '@routes/index.route';
import AccountRoute from '@/routes/account.route';
import TokenRoute from '@/routes/token.route';
import TopicRoute from '@/routes/topic.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new IndexRoute(), new AccountRoute(), new TopicRoute(), new TokenRoute()]);

app.listen();

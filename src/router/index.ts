import Router from 'koa-router';

import { chalkSUCCESS } from '@/app/chalkTip';

const fs = require('fs');

const router = new Router();

function useRoutes() {
  fs.readdirSync(__dirname).forEach((file) => {
    if (file === 'index.ts') return;
    // eslint-disable-next-line
    const linkRouter = require(`./${file}`).default;
    this.use(linkRouter.routes()).use(linkRouter.allowedMethods());
    // router.use('/front', linkRouter.routes()).use(linkRouter.allowedMethods());
    router.use('/admin', linkRouter.routes()).use(linkRouter.allowedMethods());
    this.use(router.routes()).use(router.allowedMethods()); // 这个有啥用？？？
    console.log(chalkSUCCESS(`加载${file}路由`));
  });
}

export default useRoutes;

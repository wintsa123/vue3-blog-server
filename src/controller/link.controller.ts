import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { ILink, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import linkService from '@/service/link.service';
import { isAdmin } from '@/utils';

class LinkController {
  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      status,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILink> = ctx.request.query;
    const result = await linkService.getList({
      id,
      status: isAdmin(ctx) ? status : 1,
      nowPage,
      pageSize,
      orderBy,
      orderName,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await linkService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const { email, name, avatar, desc, url, status }: ILink = ctx.request.body;
    const isExist = await linkService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的友链！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await linkService.update({
      id,
      email,
      name,
      avatar,
      desc,
      url,
      status,
    });

    successHandler({ ctx });

    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const { email, name, avatar, desc, url, status }: ILink = ctx.request.body;
    const result = await linkService.create({
      email,
      name,
      avatar,
      desc,
      url,
      status: isAdmin(ctx) ? status : 2,
    });

    successHandler({ ctx, data: result });

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const isExist = await linkService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的友链！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await linkService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new LinkController();

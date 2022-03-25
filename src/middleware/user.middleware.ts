import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import emitError from '@/app/handler/emit-error';

const schema = Joi.object({
  id: Joi.number(),
  username: Joi.string().min(3).max(12),
  password: Joi.string().min(6).max(18),
  // username: Joi.string()
  //   .pattern(/[0-9a-zA-Z_]{6,12}$/)
  //   .required(),
  // password: Joi.string()
  //   .pattern(/(?![0-9]+$)(?![a-zA-Z]+$)(?![_]+$)[0-9a-zA-A_]{8,16}/)
  //   .required(),
  title: Joi.string().min(3).max(50),
  avatar: Joi.string().min(3).max(50),
  status: [1, 2, 3],
  exp: Joi.number(),
});

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  const prop = ctx.request.body;
  try {
    console.log('user-verifyProp');
    await schema.validateAsync(prop, {
      abortEarly: false, // when true，在第一个错误时停止验证，否则返回找到的所有错误。默认为true.
      allowUnknown: false, // 当true，允许对象包含被忽略的未知键。默认为false.
      // presence: 'required', // schema加上required()或者设置presence: 'required'。防止prop为undefined时也能通过验证
      convert: false,
    });
    console.log('llllllllllk');
  } catch (error) {
    console.log(
      '这里不仅仅会捕获joi的错误，后面的中间件报的错也会捕获到',
      error
    );
    // 这里不仅仅会捕获joi的错误，后面的中间件报的错也会捕获到
    emitError({
      ctx,
      code: 400,
      error,
    });
    return;
  }
  await next();
};

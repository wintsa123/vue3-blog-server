import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import { ALLOW_HTTP_CODE } from '@/constant';
import { CustomError } from '@/model/customError.model';

const schema = Joi.object({
  id: Joi.number(),
  title: Joi.string().min(1).max(50),
  desc: Joi.string().allow('').allow(null).max(50),
  content: Joi.string().allow('').allow(null),
  priority: [Joi.number(), null],
  is_comment: [1, 2],
  status: [1, 2],
  head_img: Joi.string().allow('').allow(null),
  click: Joi.number(),
  tags: Joi.array().items(Joi.number()),
  types: Joi.array().items(Joi.number()),
  users: Joi.array().items(Joi.number()),
  created_at: Joi.string(),
  updated_at: Joi.string(),
  deleted_at: [Joi.string(), null],
});

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  const prop = ctx.request.body;
  try {
    await schema.validateAsync(prop, {
      abortEarly: false,
      allowUnknown: false,
      convert: false,
    });
  } catch (error: any) {
    console.log(error);
    throw new CustomError(
      error.message,
      ALLOW_HTTP_CODE.paramsError,
      ALLOW_HTTP_CODE.paramsError
    );
  }
  await next();
};

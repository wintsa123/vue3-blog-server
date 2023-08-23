import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import { ALLOW_HTTP_CODE } from '@/constant';
import { CustomError } from '@/model/customError.model';

const schema = Joi.object({
  id: Joi.number(),
  name: Joi.string().min(0).max(50),
  color: Joi.string().min(1).max(30),
});

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  try {
    const props = ctx.request.body;

    await schema.validateAsync(props, {
      abortEarly: false,
      allowUnknown: true,
      convert: true,
    });
    await next();
  } catch (error: any) {
    throw new CustomError(
      error.message,
      ALLOW_HTTP_CODE.paramsError,
      ALLOW_HTTP_CODE.paramsError
    );
  }
};

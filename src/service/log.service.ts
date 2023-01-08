import Sequelize from 'sequelize';

import { ILog, IList } from '@/interface';
import logModel from '@/model/log.model';
import { handlePaging } from '@/utils';
import { chalkWARN } from '@/utils/chalkTip';

const { Op } = Sequelize;

class LogService {
  /** 日志是否存在 */
  async isExist(ids: number[]) {
    const res = await logModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取日志列表 */
  async getList({
    id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
  }: IList<ILog>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = {};
    if (id) {
      allWhere.id = +id;
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          api_user_agent: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          api_from: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          api_real_ip: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          api_host: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          api_hostname: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          api_path: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    // @ts-ignore
    const result = await logModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 判断该ip今天的日志记录是否合法 */
  async isPass(api_real_ip: ILog['api_real_ip']) {
    let flag = true;
    const nowDate = new Date().getTime();
    const [oneSecondApiNum, oneMinuteApiNum, oneHourApiNum, oneDayApiNum] =
      await Promise.all([
        logModel.count({
          where: {
            api_real_ip,
            created_at: {
              // 一秒钟内访问的次数
              [Op.between]: [new Date(nowDate - 1000), new Date(nowDate)],
            },
          },
        }),
        logModel.count({
          where: {
            api_real_ip,
            created_at: {
              // 一分钟内访问的次数
              [Op.between]: [new Date(nowDate - 1000 * 60), new Date(nowDate)],
            },
          },
        }),
        logModel.count({
          where: {
            api_real_ip,
            created_at: {
              // 一小时内访问的次数
              [Op.between]: [
                new Date(nowDate - 1000 * 60 * 60),
                new Date(nowDate),
              ],
            },
          },
        }),
        logModel.count({
          where: {
            api_real_ip,
            created_at: {
              // 一天内访问的次数
              [Op.between]: [
                new Date(nowDate - 1000 * 60 * 60 * 24),
                new Date(nowDate),
              ],
            },
          },
        }),
      ]);

    oneSecondApiNum > 20 && (flag = false);
    oneMinuteApiNum > 100 && (flag = false);
    oneHourApiNum > 2000 && (flag = false);
    oneDayApiNum > 5000 && (flag = false);
    console.log(
      flag,
      chalkWARN(
        `判断该ip今天的日志记录是否合法:${
          flag ? '合法' : '不合法'
        }; oneSecondApiNum:${oneSecondApiNum},oneMinuteApiNum:${oneMinuteApiNum},oneHourApiNum:${oneHourApiNum},oneDayApiNum:${oneDayApiNum}`
      )
    );
    return flag;
  }

  /** 查找日志 */
  async find(id: number) {
    const result = await logModel.findOne({ where: { id } });
    return result;
  }

  /** 修改日志 */
  async update({
    id,
    user_id,
    api_user_agent,
    api_from,
    api_referer,
    api_forwarded_for,
    api_real_ip,
    api_host,
    api_hostname,
    api_method,
    api_path,
    api_query,
    api_body,
    api_status_code,
    api_error,
    api_err_code,
    api_err_msg,
    api_duration,
  }: ILog) {
    const result = await logModel.update(
      {
        id,
        user_id,
        api_user_agent,
        api_from,
        api_referer,
        api_forwarded_for,
        api_real_ip,
        api_host,
        api_hostname,
        api_method,
        api_path,
        api_query,
        api_body,
        api_status_code,
        api_error,
        api_err_code,
        api_err_msg,
        api_duration,
      },
      { where: { id } }
    );
    return result;
  }

  /** 创建日志 */
  async create({
    user_id,
    api_user_agent,
    api_from,
    api_referer,
    api_forwarded_for,
    api_real_ip,
    api_host,
    api_hostname,
    api_method,
    api_path,
    api_query,
    api_body,
    api_status_code,
    api_error,
    api_err_code,
    api_err_msg,
    api_duration,
  }: ILog) {
    const result = await logModel.create({
      user_id,
      api_user_agent,
      api_from,
      api_referer,
      api_forwarded_for,
      api_real_ip,
      api_host,
      api_hostname,
      api_method,
      api_path,
      api_query,
      api_body,
      api_status_code,
      api_error,
      api_err_code,
      api_err_msg,
      api_duration,
    });
    return result;
  }

  /** 删除90天前的日志 */
  async deleteRang() {
    const nowDate = new Date().getTime();
    const result = await logModel.destroy({
      where: {
        created_at: {
          [Op.lt]: new Date(nowDate - 1000 * 60 * 60 * 24 * 90),
        },
      },
      force: true, // WARN 不用软删除，直接硬性删除数据库的记录
      individualHooks: false,
    });
    return result;
  }

  /** 删除日志 */
  async delete(id: number) {
    const result = await logModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new LogService();

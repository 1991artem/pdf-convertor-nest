import { USER_ROLES } from '../modules/user/constants/index';
import User from '../modules/user/entities';
import { hashPassword } from './helpers';
import { config } from '../config';

const seed = async () => {
  const hasUser = await User.count();

  if (!hasUser) {
    const user = new User();

    user.email = config.INIT.admin_email;
    user.userName = config.INIT.admin_name;
    user.role = USER_ROLES.ADMIN;
    user.password = hashPassword(config.INIT.admin_password);
    await user.save();
    // eslint-disable-next-line no-console
    console.log('user admin created');
  }
};

export { seed };

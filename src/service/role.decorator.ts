import { SetMetadata } from '@nestjs/common';
import { USER_ROLES } from '../modules/user/constants';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: USER_ROLES[]) => SetMetadata(ROLES_KEY, roles);

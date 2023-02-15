import { USER_ROLES } from '../modules/user/constants/index';

export interface IUserRequest {
  email: string;
  userName: string;
  id: string;
  role: USER_ROLES;
}

declare global {
  namespace Express {
    export interface Request {
      user?: IUserRequest;
    }
  }
}

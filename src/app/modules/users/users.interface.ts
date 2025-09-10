import { User } from '@prisma/client';

export type IUser = Omit<User, 'password'>;

export interface ILoginUserResponse {
  user: User;
  accessToken: string;
}

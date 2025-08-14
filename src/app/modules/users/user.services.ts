import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

import { IUser } from './users.interface';
import httpStatus from 'http-status';

import { ILoginUserResponse } from './users.interface';
import prisma from '@/app/lib/prisma';
import { generateToken } from '@/app/utils/generateToken';
import { ApiError } from '@/app/errors/apiError';

const createUser = async (payload: User): Promise<IUser> => {
  try {
    const { email, password, name, role, avatarUrl } = payload;

    const isExist = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (isExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        avatarUrl,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;

    return userWithoutPassword;
  } catch (error) {
    console.log(error);
    throw error; // rethrow to let upper layer handle it
  }
};

const loginUser = async (payload: User): Promise<ILoginUserResponse> => {
  try {
    const { email, password } = payload;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
    }

    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    });

    return { accessToken };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const UserServices = {
  createUser,
  loginUser,
};

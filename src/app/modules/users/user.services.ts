import bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';

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

    return {user, accessToken };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllUsers = async (options: {
  page?: number;
  limit?: number;
  id?: string;
  name?: string;
  email?: string;
}): Promise<{ meta: { page: number; limit: number; total: number }; data: IUser[] }> => {
  const { page = 1, limit = 10, id, name, email } = options;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.UserWhereInput = {};

    if (id) {
      where.id = id;
    }
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }
    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive',
      };
    }

    const result = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve users');
  }
};

export const UserServices = {
  createUser,
  loginUser,
  getAllUsers,
};

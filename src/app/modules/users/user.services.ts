import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { Prisma, User, Role } from '@prisma/client';

import { IUser } from './users.interface';
import httpStatus from 'http-status';

import { ILoginUserResponse } from './users.interface';
import prisma from '@/app/lib/prisma';
import { generateToken } from '@/app/utils/generateToken';
import { ApiError } from '@/app/errors/apiError';
import config from '@/app/config';

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

const createUser = async (payload: User): Promise<IUser> => {
  try {
    const { email, password, name, role, avatarUrl } = payload;

    if (!password) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required');
    }

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

    if (!password) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required');
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (!user.password) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'This account uses Google Sign-In. Please continue with Google instead.',
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
    }

    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });

    const { password: _password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const loginWithGoogle = async (idToken: string): Promise<ILoginUserResponse> => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      // Web frontend tokens are audienced to GOOGLE_CLIENT_ID; the Android app's tokens
      // are audienced to GOOGLE_ANDROID_CLIENT_ID (Google won't allow a custom-scheme
      // redirect URI for a 'WEB' client, so Android authenticates through its own client).
      audience: [config.GOOGLE_CLIENT_ID, config.GOOGLE_ANDROID_CLIENT_ID].filter(
        (id): id is string => !!id,
      ),
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.email_verified) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Could not verify Google account');
    }

    const { email, name, picture } = payload;

    // Link by verified email: Google already proved ownership of this address, so
    // it's safe to attach to an existing account (password-based or Google-only)
    // rather than creating a duplicate.
    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name ?? null,
          avatarUrl: picture ?? null,
          password: null,
          role: Role.USER,
        },
      });
    }

    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });

    const { password: _password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken };
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
      where.email = email;
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

const changeUserRole = async (userId: string, newRole: Role): Promise<IUser> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: newRole,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to change user role');
  }
};

const getProfile = async (userId: string): Promise<IUser | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve profile');
  }
};

const editProfile = async (userId: string, payload: Partial<User>): Promise<IUser | null> => {
  try {
    const { name, avatarUrl } = payload;

    const data: { name?: string | null; avatarUrl?: string | null } = {};
    if (typeof name !== 'undefined') data.name = name;
    if (typeof avatarUrl !== 'undefined') data.avatarUrl = avatarUrl;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update profile');
  }
};

const resetPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (!user.password) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'This account uses Google Sign-In and has no password to reset.',
      );
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to reset password');
  }
};

export const UserServices = {
  createUser,
  loginUser,
  loginWithGoogle,
  getAllUsers,
  changeUserRole,
  getProfile,
  editProfile,
  resetPassword,
};

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword } from '../../utils';
import { Brackets, Repository } from 'typeorm';
import User from './entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private _usersRepository: Repository<User>,
  ) {}

  async getUserByLoginAndPassword(login: string, password: string) {
    const user = await this._usersRepository
      .createQueryBuilder()
      .select(['user.id', 'user.userName', 'user.email', 'user.role'])
      .from(User, 'user')
      .andWhere('user.password = :password', {
        password: hashPassword(password),
      })
      .andWhere(
        new Brackets((queryBuilder) => {
          queryBuilder
            .where('user.email = :login', { login })
            .orWhere('user.userName = :login', { login })
            .andWhere('user.userName IS NOT NULL');
        }),
      )
      .printSql()
      .getOne();

    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this._usersRepository.findOne({
      where: {
        id,
      },
    });
    return user;
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { USER_ROLES } from '../constants';
import File from '../../file/entities';

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  userName: string;

  @Column()
  @Index()
  password: string;

  @Column({
    type: 'enum',
    enum: USER_ROLES,
    default: USER_ROLES.CLIENT,
  })
  role: USER_ROLES;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => File, (file: File) => file.user, {
    cascade: true,
  })
  files: File[];
}

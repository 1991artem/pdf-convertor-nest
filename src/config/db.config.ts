import * as dotenv from 'dotenv';

import User from '../modules/user/entities';
import File from '../modules/file/entities';

dotenv.config();

const user = process.env.DB_USER;
const host = process.env.DB_HOST || 'localhost';
const database = process.env.DB_NAME;
const password = process.env.DB_PASS;

const db_port = process.env.DB_PORT || 5432;

if (!user) {
  throw new Error('DB_USER not set');
}
if (!database) {
  throw new Error('DB_NAME not set');
}
if (!password) {
  throw new Error('DB_PASSWORD not set');
}

const DB = {
  type: 'postgres',
  host,
  port: Number(db_port),
  username: user,
  password,
  database,
  entities: [User, File],
  synchronize: true,
  logging: false,
  migrations: ['../migrations/*.ts'],
  migrationsTableName: 'migration_list',
};

export default DB;

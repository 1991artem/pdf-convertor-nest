import * as dotenv from 'dotenv';

dotenv.config();

const admin_name = process.env.ADMIN_NAME || '';
const admin_password = process.env.ADMIN_PASS || '';
const admin_email = process.env.ADMIN_EMAIL || 'admin@admin.admin';

if (!admin_name) {
  throw new Error('ADMIN_NAME not set. Check env');
}
if (!admin_password) {
  throw new Error('ADMIN_PASS not set. Check env');
}

export { admin_password, admin_name, admin_email };

const bcrypt = require('bcryptjs');
const db = require('./models');

(async () => {
  try {
    const users = await db.User.findAll();

    for (const user of users) {
      if (!user.password.startsWith('$2a$')) { // Check if password is already hashed
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        await user.save();
        console.log(`Rehashed password for user: ${user.username}`);
      }
    }

    console.log('Password rehashing complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error rehashing passwords:', error);
    process.exit(1);
  }
})();
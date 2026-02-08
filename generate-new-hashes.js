const bcrypt = require('bcryptjs');

(async () => {
  const hash1 = await bcrypt.hash('hareesh@123', 10);
  const hash2 = await bcrypt.hash('santhaK@123', 10);
  
  console.log('hareesh@123 hash:', hash1);
  console.log('santhaK@123 hash:', hash2);
})();

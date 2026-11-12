const bcrypt = require("bcrypt");
const pool = require("../../config/db"); // Adjust path to your database configuration if needed

const seedAdmin = async () => {
  try {
    console.log("🌱 Seeding Brito School Admin...");

    // 1. Hash the password securely using bcrypt
    const plainPassword = "admin@123";
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // 2. Temporarily disable foreign key checks to allow truncation
    await pool.query("SET FOREIGN_KEY_CHECKS = 0;");

    // 3. Truncate admins table to reset auto-increment ID to 1
    await pool.query("TRUNCATE TABLE admins;");

    // 4. Re-enable foreign key checks
    await pool.query("SET FOREIGN_KEY_CHECKS = 1;");

    // 5. Insert the admin matching your exact table columns
    const query = `
      INSERT INTO admins (
        id,
        email, 
        password, 
        mobile_number, 
        full_name, 
        alternative_email, 
        phone_primary, 
        phone_secondary, 
        School_location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      1,
      "admin@britoschool.com",
      hashedPassword,
      "9876543210",
      "St. Britto Hr. Sec. School",
      "admin@stbritoschool.com",
      "8012693457",
      "8012693457",
      "Aarappalayam madurai"
    ];

    await pool.execute(query, values);

    console.log("✅ Admin seeded successfully!");
    console.log("----------------------------------------");
    console.log("Email: admin@britoschool.com");
    console.log("Password: admin@123");
    console.log("----------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedAdmin();
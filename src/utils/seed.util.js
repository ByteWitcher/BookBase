import bcrypt from "bcryptjs";
import userRepository from "../repositories/user.repository.js";

class SeedUtil {
  async createDefaultAdmin() {
    const adminEmail = "superadmin@gmail.com";
    
    // Check if admin already exists
    const existingAdmin = await userRepository.findByEmail(adminEmail);
    if (existingAdmin) {
      console.log("Default admin user already exists.");
      return existingAdmin;
    }

    try {
      // Hash the default password
      const hashedPassword = await bcrypt.hash("superadmin123", 10);

      // Create the admin user
      const adminUser = await userRepository.create({
        username: "superadmin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      });

      console.log("✅ Default admin user created successfully:");
      
      return adminUser;
    } catch (error) {
      console.error("❌ Failed to create default admin user:", error.message);
      throw error;
    }
  }

  async seedDatabase() {
    try {
      console.log("🌱 Starting database seeding...");
      await this.createDefaultAdmin();
      console.log("🌱 Database seeding completed.");
    } catch (error) {
      console.error("❌ Database seeding failed:", error.message);
      throw error;
    }
  }
}

export default new SeedUtil();
/**
 * Seeds the database with an admin account, sample departments, and categories
 * so the app is immediately usable after a fresh install.
 * Run with: npm run seed
 */
import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";

const run = async () => {
  await connectDB();

  const departmentNames = [
    "Academics",
    "Hostel",
    "Transport",
    "Library",
    "Accounts",
    "Examination Cell",
    "Medical Center",
    "IT & WiFi",
    "Maintenance",
    "Placement Cell",
    "Mess",
  ];

  const departments = {};
  for (const name of departmentNames) {
    const dept = await Department.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true }
    );
    departments[name] = dept._id;
  }

  const categories = [
    { name: "Academic", department: "Academics" },
    { name: "Hostel", department: "Hostel" },
    { name: "Transport", department: "Transport" },
    { name: "Library", department: "Library" },
    { name: "Accounts", department: "Accounts" },
    { name: "Examination", department: "Examination Cell" },
    { name: "Medical", department: "Medical Center" },
    { name: "WiFi", department: "IT & WiFi" },
    { name: "Maintenance", department: "Maintenance" },
    { name: "Placement Cell", department: "Placement Cell" },
    { name: "Mess", department: "Mess" },
    { name: "Others", department: "Academics" },
  ];

  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { name: cat.name },
      { name: cat.name, department: departments[cat.department] },
      { upsert: true, new: true }
    );
  }

  const adminEmail = "admin@campusconnect.ai";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "System Admin",
      email: adminEmail,
      password: "Admin@12345",
      role: "admin",
      isEmailVerified: true,
    });
    console.log(`[seed] Admin created -> email: ${adminEmail} | password: Admin@12345`);
  } else {
    console.log("[seed] Admin already exists, skipping.");
  }

  console.log(`[seed] ${departmentNames.length} departments and ${categories.length} categories ready.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});

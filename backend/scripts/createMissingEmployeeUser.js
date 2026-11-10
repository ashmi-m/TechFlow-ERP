
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const Employee = require("../models/Employee");
const User = require("../models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function createMissingUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected!");

    const email = "diya@gmail.com";

    // Find existing employee
    const employee = await Employee.findOne({ email });

    if (!employee) {
      console.log("Employee record not found.");
      return;
    }

    // Check whether login account already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Login account already exists.");
      return;
    }

    rl.question("Enter a new password for Diya: ", async (password) => {
      try {
        if (password.length < 8) {
          console.log("Password must contain at least 8 characters.");
          return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
          name: employee.name,
          email: employee.email,
          password: hashedPassword,
          role: "employee",
        });

        console.log("Diya's login account created successfully!");
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        rl.close();
        await mongoose.disconnect();
      }
    });

  } catch (error) {
    console.error("Error:", error.message);
    rl.close();
    await mongoose.disconnect();
  }
}

createMissingUser();
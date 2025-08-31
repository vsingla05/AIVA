import mongoose from "mongoose";
import dotenv from "dotenv";
import {Employee} from '../models/employees/index.js'
import connectDB from '../ConnectDB.js'

dotenv.config();

const employeesData = [
  {
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    password: "password123",
    phone: "1234567890",
    address: "123 Main St, Cityville",
    role: "EMPLOYEE",
    skills: [
      { name: "Node.js", level: 4 },
      { name: "React", level: 3 },
      { name: "API Development", level: 5 },
    ],
    currentLoad: 10,
    availability: { maxWeeklyHours: 40, holidays: [new Date("2025-09-15")] },
    performance: { taskCompletionRate: 0.9, avgQualityRating: 0.85 },
  },
  {
    name: "Bob Smith",
    email: "bob.smith@example.com",
    password: "password123",
    phone: "0987654321",
    address: "456 Elm St, Townsville",
    role: "EMPLOYEE",
    skills: [
      { name: "Python", level: 5 },
      { name: "Data Analysis", level: 4 },
      { name: "Machine Learning", level: 3 },
    ],
    currentLoad: 20,
    availability: { maxWeeklyHours: 35, holidays: [new Date("2025-09-18")] },
    performance: { taskCompletionRate: 0.8, avgQualityRating: 0.75 },
  },
  {
    name: "Charlie Lee",
    email: "charlie.lee@example.com",
    password: "password123",
    phone: "5551234567",
    address: "789 Oak St, Villageville",
    role: "EMPLOYEE",
    skills: [
      { name: "Java", level: 4 },
      { name: "Spring Boot", level: 3 },
      { name: "Database Management", level: 4 },
    ],
    currentLoad: 15,
    availability: { maxWeeklyHours: 40, holidays: [new Date("2025-09-20")] },
    performance: { taskCompletionRate: 0.85, avgQualityRating: 0.8 },
  },
  {
    name: "Diana Prince",
    email: "diana.prince@example.com",
    password: "password123",
    phone: "7778889999",
    address: "101 Maple St, Metropolis",
    role: "EMPLOYEE",
    skills: [
      { name: "React", level: 5 },
      { name: "UI/UX Design", level: 4 },
      { name: "Front-end Testing", level: 3 },
    ],
    currentLoad: 5,
    availability: { maxWeeklyHours: 40, holidays: [] },
    performance: { taskCompletionRate: 0.95, avgQualityRating: 0.9 },
  },
];

async function seedEmployees() {
  try {
    
    connectDB()
    
    // Remove existing employees
    // await Employee.deleteMany({});
    console.log("Existing employees removed");

    // Insert new seed data
    for (const emp of employeesData) {
      const employee = new Employee(emp);
      await employee.save();
      console.log(`Employee ${emp.name} added`);
    }

    console.log("All employees seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding employees:", err);
    process.exit(1);
  }
}

seedEmployees();

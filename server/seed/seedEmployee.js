import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { Employee } from "../models/employees/index.js";
import connectDB from "../ConnectDB.js";
import {getGeminiEmbedding} from '../controllers/ai/getEmbeddings.js'

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const localImagePath =
  "/Users/vanshsingla/Desktop/AIVA/server/images/profilePhotos/profilePhoto.jpg";

const employeesData = [
  // 🧩 SOFTWARE DEVELOPMENT TEAM
  {
    name: "Vansh Singla",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Software Development",
    role: "EMPLOYEE",
    skills: [
      { name: "JavaScript", level: 5 },
      { name: "React", level: 5 },
      { name: "Node.js", level: 4 },
      { name: "MongoDB", level: 4 }
    ]
  },
  {
    name: "Neha Kapoor",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Software Development",
    skills: [
      { name: "Python", level: 5 },
      { name: "Django", level: 4 },
      { name: "SQL", level: 4 },
      { name: "REST APIs", level: 4 }
    ]
  },
  {
    name: "Ritik Sharma",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Software Development",
    skills: [
      { name: "HTML", level: 4 },
      { name: "CSS", level: 4 },
      { name: "JavaScript", level: 3 },
      { name: "React", level: 3 }
    ]
  },

  // 🤖 AI & DATA SCIENCE TEAM
  {
    name: "Vivek Gupta",
    email: "vivekgupta92053@gmail.com",
    password: "vivek",
    department: "AI & Data Science",
    skills: [
      { name: "Machine Learning", level: 5 },
      { name: "Python", level: 5 },
      { name: "Scikit-Learn", level: 4 },
      { name: "Statistics", level: 4 }
    ]
  },
  {
    name: "Rohan Gupta",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "AI & Data Science",
    skills: [
      { name: "Deep Learning", level: 4 },
      { name: "TensorFlow", level: 4 },
      { name: "NLP", level: 4 },
      { name: "Computer Vision", level: 3 }
    ]
  },
  {
    name: "Sanya Dutta",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "AI & Data Science",
    skills: [
      { name: "Data Cleaning", level: 3 },
      { name: "Pandas", level: 3 },
      { name: "Matplotlib", level: 3 },
      { name: "SQL", level: 3 }
    ]
  },

  // 🎨 UI/UX DESIGN TEAM
  {
    name: "Kavya Bansal",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "UI/UX Design",
    skills: [
      { name: "UI Design", level: 5 },
      { name: "Figma", level: 4 },
      { name: "Prototyping", level: 4 },
      { name: "Design Thinking", level: 4 }
    ]
  },
  {
    name: "Riya Oberoi",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "UI/UX Design",
    skills: [
      { name: "Graphic Design", level: 5 },
      { name: "Photoshop", level: 4 },
      { name: "Illustrator", level: 4 },
      { name: "Branding", level: 3 }
    ]
  },
  {
    name: "Tushar Jain",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "UI/UX Design",
    skills: [
      { name: "Wireframing", level: 3 },
      { name: "Figma", level: 3 },
      { name: "Color Theory", level: 3 },
      { name: "Accessibility", level: 2 }
    ]
  },

  // 📈 MARKETING TEAM
  {
    name: "Simran Kaur",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Marketing",
    skills: [
      { name: "Digital Marketing", level: 5 },
      { name: "SEO", level: 4 },
      { name: "Google Ads", level: 3 },
      { name: "Social Media", level: 4 }
    ]
  },
  {
    name: "Karan Malhotra",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Marketing",
    skills: [
      { name: "Content Writing", level: 5 },
      { name: "Copywriting", level: 4 },
      { name: "Email Marketing", level: 4 }
    ]
  },
  {
    name: "Avni Deshmukh",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Marketing",
    skills: [
      { name: "SEO", level: 3 },
      { name: "Social Media Ads", level: 3 },
      { name: "Analytics", level: 3 }
    ]
  },

  // 💰 SALES TEAM
  {
    name: "Mohit Kumar",
    email: "mohit7909kumar@gmail.com",
    password: "mohit",
    department: "Sales",
    skills: [
      { name: "B2B Sales", level: 5 },
      { name: "Negotiation", level: 4 },
      { name: "CRM Tools", level: 4 }
    ]
  },
  {
    name: "Meera Iyer",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Sales",
    skills: [
      { name: "Client Acquisition", level: 4 },
      { name: "Presentation Skills", level: 4 },
      { name: "Lead Generation", level: 3 }
    ]
  },
  {
    name: "Adarsh Menon",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Sales",
    skills: [
      { name: "Cold Calling", level: 3 },
      { name: "CRM", level: 3 },
      { name: "Follow-ups", level: 2 }
    ]
  },

  // 🧾 FINANCE TEAM
  {
    name: "Rajesh Nanda",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Finance",
    skills: [
      { name: "Accounting", level: 5 },
      { name: "Taxation", level: 4 },
      { name: "Financial Analysis", level: 4 }
    ]
  },
  {
    name: "Pooja Agarwal",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Finance",
    skills: [
      { name: "Payroll", level: 4 },
      { name: "Excel", level: 4 },
      { name: "Budget Planning", level: 3 }
    ]
  },
  {
    name: "Ravi Desai",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Finance",
    skills: [
      { name: "Bookkeeping", level: 3 },
      { name: "Invoicing", level: 3 },
      { name: "Reports", level: 2 }
    ]
  },

  // 💼 HR TEAM
  {
    name: "Tanya Singh",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Human Resources",
    skills: [
      { name: "HR Management", level: 5 },
      { name: "Recruitment", level: 4 },
      { name: "Employee Relations", level: 4 }
    ]
  },
  {
    name: "Abhishek Tiwari",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Human Resources",
    skills: [
      { name: "Payroll", level: 4 },
      { name: "Onboarding", level: 3 },
      { name: "Conflict Resolution", level: 3 }
    ]
  },
  {
    name: "Isha Sharma",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Human Resources",
    skills: [
      { name: "Interview Scheduling", level: 2 },
      { name: "HR Tools", level: 2 },
      { name: "Documentation", level: 3 }
    ]
  },

  // ⚙️ OPERATIONS TEAM
  {
    name: "Rakesh Khanna",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Operations",
    skills: [
      { name: "Project Management", level: 5 },
      { name: "Agile", level: 5 },
      { name: "Scrum", level: 4 }
    ]
  },
  {
    name: "Aarav Patel",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Operations",
    skills: [
      { name: "DevOps", level: 4 },
      { name: "AWS", level: 4 },
      { name: "Monitoring", level: 3 }
    ]
  },
  {
    name: "Vivek Das",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Operations",
    skills: [
      { name: "Scheduling", level: 3 },
      { name: "Process Optimization", level: 3 },
      { name: "Team Coordination", level: 2 }
    ]
  },

  // 🔒 SECURITY TEAM
  {
    name: "Aman Bhatt",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Security",
    skills: [
      { name: "Cybersecurity", level: 5 },
      { name: "Penetration Testing", level: 4 },
      { name: "OWASP", level: 4 }
    ]
  },
  {
    name: "Divya Rathi",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Security",
    skills: [
      { name: "Network Security", level: 3 },
      { name: "Vulnerability Testing", level: 3 },
      { name: "Incident Response", level: 2 }
    ]
  },

  // ☁️ CLOUD TEAM
  {
    name: "Rajeev Menon",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Cloud Infrastructure",
    skills: [
      { name: "AWS", level: 5 },
      { name: "Azure", level: 4 },
      { name: "Terraform", level: 4 }
    ]
  },
  {
    name: "Harshit Nair",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Cloud Infrastructure",
    skills: [
      { name: "Docker", level: 3 },
      { name: "Kubernetes", level: 3 },
      { name: "CI/CD", level: 3 }
    ]
  },

  // 🎯 MANAGEMENT TEAM
  {
    name: "Nidhi Desai",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Management",
    skills: [
      { name: "Strategic Planning", level: 5 },
      { name: "Leadership", level: 4 },
      { name: "Decision Making", level: 4 }
    ]
  },
  {
    name: "Arnav Verma",
    email: "vnsingla2005@gmail.com",
    password: "vansh",
    department: "Management",
    skills: [
      { name: "Resource Allocation", level: 3 },
      { name: "Risk Management", level: 3 },
      { name: "Reporting", level: 3 }
    ]
  }
];



async function seedEmployees() {
  try {
    await connectDB();
    console.log("✅ Database connected");

    await Employee.deleteMany({});
    console.log("🧹 Existing employees removed");

    for (const emp of employeesData) {
      // Upload profile image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(localImagePath, {
        folder: "AIVA/profilePhotos",
      });

      const employee = new Employee({
        ...emp,
        imageUrl: uploadResult.secure_url,
      });

      await employee.save();
      console.log(`✅ Employee added: ${emp.name}`);

      // 🌟 Generate and cache embeddings for each skill
      for (const skill of emp.skills) {
        try {
          const embedding = await getGeminiEmbedding(skill.name, employee._id);
          console.log(`🧠 Embedding generated for ${emp.name} → ${skill.name}`);
        } catch (embedErr) {
          console.warn(`⚠️ Failed embedding for ${emp.name} → ${skill.name}:`, embedErr.message);
        }
      }
    }

    console.log("🎉 All employees seeded + embeddings generated!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding employees:", err);
    process.exit(1);
  }
}

seedEmployees();
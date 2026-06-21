/**
 * Run this script to generate a sample attendance Excel file for testing.
 * Usage: node create-sample-excel.js
 * Output: sample-attendance.xlsx (open in the project root)
 */

const XLSX = require("xlsx");
const path = require("path");

const students = [
  { "Roll No": "CS001", "Student Name": "Aisha Raza", "Email": "aisha@college.edu", "Phone": "9876543210", "Classes Attended": 28, "Total Classes": 40 },
  { "Roll No": "CS002", "Student Name": "Rahul Verma", "Email": "rahul@college.edu", "Phone": "9876543211", "Classes Attended": 25, "Total Classes": 40 },
  { "Roll No": "CS003", "Student Name": "Priya Singh", "Email": "priya@college.edu", "Phone": "9876543212", "Classes Attended": 35, "Total Classes": 40 },
  { "Roll No": "CS004", "Student Name": "Karan Mehta", "Email": "karan@college.edu", "Phone": "9876543213", "Classes Attended": 18, "Total Classes": 40 },
  { "Roll No": "CS005", "Student Name": "Sneha Patel", "Email": "sneha@college.edu", "Phone": "9876543214", "Classes Attended": 30, "Total Classes": 40 },
  { "Roll No": "CS006", "Student Name": "Arjun Sharma", "Email": "arjun@college.edu", "Phone": "9876543215", "Classes Attended": 22, "Total Classes": 40 },
  { "Roll No": "CS007", "Student Name": "Meera Nair", "Email": "meera@college.edu", "Phone": "9876543216", "Classes Attended": 38, "Total Classes": 40 },
  { "Roll No": "CS008", "Student Name": "Dev Patel", "Email": "dev@college.edu", "Phone": "9876543217", "Classes Attended": 15, "Total Classes": 40 },
];

const ws = XLSX.utils.json_to_sheet(students);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Attendance");

const outputPath = path.join(__dirname, "sample-attendance.xlsx");
XLSX.writeFile(wb, outputPath);

console.log("✅ Sample Excel file created:", outputPath);
console.log("📊 Students:", students.length);
console.log("⚠️  Defaulters (<75%):", students.filter(s => (s["Classes Attended"] / s["Total Classes"]) * 100 < 75).map(s => s["Student Name"]).join(", "));

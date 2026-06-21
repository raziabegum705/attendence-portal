const XLSX = require("xlsx");

function parseAttendance(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  return rows.map((row) => {
    const attended = Number(row["Classes Attended"] || row["Attended"] || 0);
    const total = Number(row["Total Classes"] || row["Total"] || 1);
    const percentage = ((attended / total) * 100).toFixed(2);
    return {
      rollNo: String(row["Roll No"] || row["Roll Number"] || row["RollNo"] || ""),
      name: String(row["Student Name"] || row["Name"] || ""),
      email: String(row["Email"] || row["email"] || ""),
      phone: String(row["Phone"] || row["Mobile"] || row["Contact"] || ""),
      attended,
      total,
      percentage,
      isDefaulter: parseFloat(percentage) < 75,
    };
  }).filter(r => r.name && r.email);
}

module.exports = parseAttendance;

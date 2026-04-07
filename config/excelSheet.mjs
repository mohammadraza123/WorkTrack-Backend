import ExcelJS from "exceljs";

export const generateAttendanceExcel = async (records) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance");

  // Headers
  sheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Check In", key: "checkIn", width: 15 },
    { header: "Check Out", key: "checkOut", width: 15 },
    { header: "Total Hours", key: "totalHours", width: 15 },
    { header: "Locations", key: "locations", width: 50 },
  ];

  records.forEach((rec) => {
    sheet.addRow({
      date: new Date(rec.date).toLocaleDateString(),
      checkIn: rec.checkIn
        ? new Date(rec.checkIn).toLocaleTimeString()
        : "--:--",
      checkOut: rec.checkOut
        ? new Date(rec.checkOut).toLocaleTimeString()
        : "--:--",
      totalHours: rec.totalHours || "0:00",
      locations: rec.locationLogs
        ? rec.locationLogs
            .map(
              (loc) =>
                `${loc.locationName || "Unknown"} (${new Date(
                  loc.timestamp,
                ).toLocaleTimeString()})`,
            )
            .join("\n")
        : "--",
    });
  });

  // Enable text wrap for Locations column
  sheet.getColumn("locations").alignment = { wrapText: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

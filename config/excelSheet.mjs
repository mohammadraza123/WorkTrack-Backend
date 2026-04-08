import ExcelJS from "exceljs";

export const generateAttendanceExcel = async (records) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance");

  // Headers
  sheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Check In", key: "checkIn", width: 15 },
    { header: "Check Out", key: "checkOut", width: 15 },
    { header: "Locations", key: "locations", width: 50 },
  ];

  // Helper to convert UTC to local time
  const formatLocalTime = (utcDateStr) => {
    if (!utcDateStr) return "--:--";
    const date = new Date(utcDateStr);
    return date.toLocaleTimeString("en-GB", { hour12: false });
  };

  records.forEach((rec) => {
    sheet.addRow({
      date: rec.date
        ? new Date(rec.date).toLocaleDateString("en-GB")
        : "--/--/----",
      checkIn: formatLocalTime(rec.checkIn),
      checkOut: formatLocalTime(rec.checkOut),
      locations: rec.locationLogs
        ? rec.locationLogs
            .map(
              (loc) =>
                `${loc.locationName || "Unknown"} (${formatLocalTime(
                  loc.timestamp
                )})`
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
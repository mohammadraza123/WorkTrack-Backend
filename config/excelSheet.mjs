import ExcelJS from "exceljs";

export const generateAttendanceExcel = async (records) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance");

  // Headers
  sheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Check In", key: "checkIn", width: 15 },
    { header: "Check Out", key: "checkOut", width: 15 },
    // { header: "Locations", key: "locations", width: 50 },
  ];

  // Border style (reuse)
  const borderStyle = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Helper to convert UTC to local time
  const formatLocalTime = (utcDateStr) => {
    if (!utcDateStr) return "--:--";
    const date = new Date(utcDateStr);
    return date.toLocaleTimeString("en-GB", { hour12: false });
  };

  // Style headers (center + bold + border)
  sheet.getRow(1).eachCell((cell) => {
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.font = { bold: true };
    cell.border = borderStyle;
  });

  records.forEach((rec) => {
    const row = sheet.addRow({
      date: rec.date
        ? new Date(rec.date).toLocaleDateString("en-GB")
        : "--/--/----",
      checkIn: formatLocalTime(rec.checkIn),
      checkOut: formatLocalTime(rec.checkOut),
      // locations: rec.locationLogs
      //   ? rec.locationLogs
      //       .map(
      //         (loc) =>
      //           `${loc.locationName || "Unknown"} (${formatLocalTime(
      //             loc.timestamp,
      //           )})`,
      //       )
      //       .join("\n")
      //   : "--",
    });

    // Apply center alignment + border to every cell in row
    row.eachCell((cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = borderStyle;
    });
  });

  // Enable wrap text for Locations column (extra safety)
  // sheet.getColumn("locations").alignment = {
  //   wrapText: true,
  //   vertical: "middle",
  //   horizontal: "center",
  // };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

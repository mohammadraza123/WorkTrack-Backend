import ExcelJS from "exceljs";

export const generateAllEmployeesExcel = async (users, AttendanceModel) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance Report");

  // 👉 Format time
  const formatLocalTime = (utcDateStr) => {
    if (!utcDateStr) return "--:--";
    return new Date(utcDateStr).toLocaleTimeString("en-GB", {
      hour12: false,
    });
  };

  // 👉 Format hours
  const formatHoursMinutes = (hoursDecimal) => {
    if (!hoursDecimal || hoursDecimal <= 0) return "0 min";

    const totalMinutes = Math.floor(hoursDecimal * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return [
      hours > 0 ? `${hours} hr` : null,
      minutes > 0 ? `${minutes} min` : null,
    ]
      .filter(Boolean)
      .join(" ");
  };

  let colIndex = 1;

  // ✅ 👉 PREVIOUS MONTH LOGIC
  // const now = new Date();
  // const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // const year = prevMonthDate.getFullYear();
  // const month = String(prevMonthDate.getMonth() + 1).padStart(2, "0");

  // const start = `${year}-${month}-01`;
  // const lastDay = new Date(year, prevMonthDate.getMonth() + 1, 0).getDate();
  // const end = `${year}-${month}-${lastDay}`;

  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const start = `${year}-${month}-01`;
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const end = `${year}-${month}-${lastDay}`;

  console.log("📊 Generating report for:", start, "to", end);

  for (const user of users) {
    const records = await AttendanceModel.find({
      user: user._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 }); // ✅ sorted

    if (!records.length) continue;

    const cols = [
      { header: "Date", width: 15 },
      { header: "Check In", width: 15 },
      { header: "Check Out", width: 15 },
      { header: "Hours", width: 12 },
      { header: "Locations", width: 40 },
    ];

    // 👉 Set column widths
    cols.forEach((col, i) => {
      sheet.getColumn(colIndex + i).width = col.width;
    });

    // 👉 Employee name (Merged Header)
    sheet.mergeCells(1, colIndex, 1, colIndex + cols.length - 1);
    const headerCell = sheet.getCell(1, colIndex);

    headerCell.value = `${user.username || user.email}`;
    headerCell.alignment = { horizontal: "center", vertical: "middle" };
    headerCell.font = { bold: true, size: 14 };

    // 👉 Column headers
    cols.forEach((col, i) => {
      const cell = sheet.getCell(2, colIndex + i);

      cell.value = col.header;
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = { bold: true };

      // ✅ Header background
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      };

      // ✅ Borders
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 👉 Data rows
    let rowIndex = 3;

    records.forEach((rec) => {
      const values = [
        rec.date,
        formatLocalTime(rec.checkIn),
        formatLocalTime(rec.checkOut),
        formatHoursMinutes(rec.totalHours),
        rec.locationLogs
          ?.map(
            (loc) =>
              `${loc.locationName || "Unknown"} (${formatLocalTime(
                loc.timestamp,
              )})`,
          )
          .join("\n") || "--",
      ];

      values.forEach((val, i) => {
        const cell = sheet.getCell(rowIndex, colIndex + i);

        cell.value = val;

        // ✅ Alignment
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };

        // ✅ Borders
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      rowIndex++;
    });

    // 👉 Move to next employee block
    colIndex += cols.length + 1;
  }

  return await workbook.xlsx.writeBuffer();
};

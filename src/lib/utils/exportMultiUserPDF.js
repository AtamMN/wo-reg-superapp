export async function exportMultiUserPDF(userGroups) {
  const pdfMake = (await import("pdfmake/build/pdfmake.js")).default;
  const pdfFonts = await import("pdfmake/build/vfs_fonts.js");
  pdfMake.vfs = pdfFonts.default.vfs;

  function convertToWIB(isoString) {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  function calculateDuration(masuk, keluar) {
    if (!masuk || !keluar) return "-";
    const dateIn = new Date(masuk);
    const dateOut = new Date(keluar);
    const diffMs = dateOut - dateIn;
    if (diffMs < 0) return "-";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} jam ${minutes} menit`;
  }

  function getWeekNumber(date) {
    const d = new Date(date);
    return Math.ceil(d.getDate() / 7);
  }

  function groupByMonthAndWeek(records) {
    const grouped = {};
    
    records.forEach(record => {
      const date = new Date(record.date);
      const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const weekNum = getWeekNumber(record.date);
      
      // Store sort key for proper chronological sorting
      const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = {
          sortKey: sortKey,
          weeks: {}
        };
      }
      
      if (!grouped[monthYear].weeks[weekNum]) {
        grouped[monthYear].weeks[weekNum] = [];
      }
      
      grouped[monthYear].weeks[weekNum].push(record);
    });
    
    return grouped;
  }

  // Build content for all users
  const content = [];

  userGroups.forEach((userGroup, index) => {
    // Add page break before each user except the first
    if (index > 0) {
      content.push({ text: '', pageBreak: 'before' });
    }

    // Calculate date range
    const dates = userGroup.records.map(r => r.date).sort();
    const startDate = dates[0] || "-";
    const endDate = dates[dates.length - 1] || "-";
    const dateRangeText = startDate === endDate 
      ? `Tanggal: ${startDate}` 
      : `Tanggal: ${startDate} s.d. ${endDate}`;

    // Calculate total duration
    let totalMinutes = 0;
    userGroup.records.forEach((item) => {
      if (item.masuk && item.keluar) {
        const dateIn = new Date(item.masuk);
        const dateOut = new Date(item.keluar);
        const diffMs = dateOut - dateIn;
        if (diffMs > 0) {
          totalMinutes += Math.floor(diffMs / (1000 * 60));
        }
      }
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const totalDurationText = `Total Jam Kerja: ${totalHours} jam ${remainingMinutes} menit`;

    // Add user header
    content.push(
      { text: "Laporan Kehadiran", style: "title", marginBottom: 10 },
      { text: `Nama: ${userGroup.userName}`, style: "sub" },
      { text: `Email: ${userGroup.userEmail}`, style: "sub" },
      { text: dateRangeText, style: "sub" },
      { text: totalDurationText, style: "totalDuration", marginBottom: 15 }
    );

    // Group records by month and week
    const groupedData = groupByMonthAndWeek(userGroup.records);

    // Build tables grouped by month and week
    // Sort months chronologically
    const sortedMonths = Object.keys(groupedData).sort((a, b) => {
      return groupedData[a].sortKey.localeCompare(groupedData[b].sortKey);
    });

    sortedMonths.forEach((monthYear, monthIndex) => {
      // Add month header
      if (monthIndex > 0) {
        content.push({ text: '', margin: [0, 10, 0, 0] });
      }
      
      // Calculate total duration for this month
      const monthRecords = Object.values(groupedData[monthYear].weeks).flat();
      let monthTotalMinutes = 0;
      monthRecords.forEach((item) => {
        if (item.masuk && item.keluar) {
          const dateIn = new Date(item.masuk);
          const dateOut = new Date(item.keluar);
          const diffMs = dateOut - dateIn;
          if (diffMs > 0) {
            monthTotalMinutes += Math.floor(diffMs / (1000 * 60));
          }
        }
      });
      const monthTotalHours = Math.floor(monthTotalMinutes / 60);
      const monthRemainingMinutes = monthTotalMinutes % 60;
      
      // Calculate working days in this month (Mon-Fri only)
      const uniqueDates = [...new Set(monthRecords.map(r => r.date))];
      const workingDays = uniqueDates.filter(dateStr => {
        const d = new Date(dateStr);
        const dayOfWeek = d.getDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri
      });
      
      // Count Friday and Mon-Thu
      let fridays = 0;
      let monToThu = 0;
      workingDays.forEach(dateStr => {
        const d = new Date(dateStr);
        if (d.getDay() === 5) fridays++;
        else monToThu++;
      });
      
      // Calculate target: (Mon-Thu: 8.5h) + (Fri: 9h)
      const monthTargetMinutes = (monToThu * 8.5 * 60) + (fridays * 9 * 60);
      const monthTargetHours = Math.floor(monthTargetMinutes / 60);
      const monthTargetRemaining = Math.floor(monthTargetMinutes % 60);
      const monthBelowTarget = monthTotalMinutes < monthTargetMinutes;
      
      content.push({
        text: monthYear,
        style: "monthHeader",
        marginBottom: 3
      });
      content.push({
        text: [
          { text: `Total: ${monthTotalHours} jam ${monthRemainingMinutes} menit` },
          { text: ` / Target: ${monthTargetHours} jam ${monthTargetRemaining} menit`, style: "targetText" }
        ],
        marginBottom: 8
      });

      const weeks = groupedData[monthYear].weeks;
      Object.keys(weeks).sort((a, b) => parseInt(a) - parseInt(b)).forEach((weekNum) => {
        const weekRecords = weeks[weekNum];

        // Calculate total duration for this week
        let weekTotalMinutes = 0;
        weekRecords.forEach((item) => {
          if (item.masuk && item.keluar) {
            const dateIn = new Date(item.masuk);
            const dateOut = new Date(item.keluar);
            const diffMs = dateOut - dateIn;
            if (diffMs > 0) {
              weekTotalMinutes += Math.floor(diffMs / (1000 * 60));
            }
          }
        });
        const weekTotalHours = Math.floor(weekTotalMinutes / 60);
        const weekRemainingMinutes = weekTotalMinutes % 60;
        
        // Calculate week target
        const weekUniqueDates = [...new Set(weekRecords.map(r => r.date))];
        const weekWorkingDays = weekUniqueDates.filter(dateStr => {
          const d = new Date(dateStr);
          const dayOfWeek = d.getDay();
          return dayOfWeek >= 1 && dayOfWeek <= 5;
        });
        
        let weekFridays = 0;
        let weekMonToThu = 0;
        weekWorkingDays.forEach(dateStr => {
          const d = new Date(dateStr);
          if (d.getDay() === 5) weekFridays++;
          else weekMonToThu++;
        });
        
        // Week target: 43 hours (4 x 8.5h + 1 x 9h)
        const weekTargetMinutes = (weekMonToThu * 8.5 * 60) + (weekFridays * 9 * 60);
        const weekTargetHours = Math.floor(weekTargetMinutes / 60);
        const weekTargetRemaining = Math.floor(weekTargetMinutes % 60);
        const weekBelowTarget = weekTotalMinutes < weekTargetMinutes;

        // Add week subheader
        content.push({
          text: `Minggu ${weekNum}`,
          style: "weekHeader",
          marginBottom: 3
        });
        content.push({
          text: [
            { text: `Total: ${weekTotalHours} jam ${weekRemainingMinutes} menit` },
            { text: ` / Target: ${weekTargetHours} jam ${weekTargetRemaining} menit`, style: "targetText" }
          ],
          marginBottom: 5
        });

        // Build table for this week
        const tableBody = [
          [
            { text: "Tanggal", style: "tableHeader" },
            { text: "Masuk", style: "tableHeader" },
            { text: "Keluar", style: "tableHeader" },
            { text: "Durasi", style: "tableHeader" }
          ]
        ];

        weekRecords.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((item) => {
          const itemDuration = calculateDuration(item.masuk, item.keluar);
          const itemDurationMinutes = item.masuk && item.keluar ? (() => {
            const dateIn = new Date(item.masuk);
            const dateOut = new Date(item.keluar);
            const diffMs = dateOut - dateIn;
            return diffMs > 0 ? Math.floor(diffMs / (1000 * 60)) : 0;
          })() : 0;
          
          // Get day of week to determine target
          const dayOfWeek = new Date(item.date).getDay();
          const isFriday = dayOfWeek === 5;
          const targetMinutes = isFriday ? 9 * 60 : 8.5 * 60; // 9h for Friday, 8.5h for Mon-Thu
          const isDayBelowTarget = itemDurationMinutes < targetMinutes && itemDurationMinutes > 0;
          
          tableBody.push([
            item.date,
            convertToWIB(item.masuk) + " WIB",
            convertToWIB(item.keluar) + " WIB",
            { 
              text: itemDuration,
              color: isDayBelowTarget ? '#dc2626' : '#000000'
            }
          ]);
        });

        // Add total row at the end of table
        tableBody.push([
          { text: "Total Minggu", bold: true, fillColor: '#f9fafb' },
          { text: "", fillColor: '#f9fafb' },
          { text: "", fillColor: '#f9fafb' },
          { 
            text: `${weekTotalHours} jam ${weekRemainingMinutes} menit`, 
            bold: true, 
            fillColor: '#f9fafb'
          }
        ]);

        content.push({
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*"],
            body: tableBody
          },
          layout: 'lightHorizontalLines',
          marginBottom: 10
        });
      });
    });
  });

  // Get overall date range for filename
  const allDates = userGroups.flatMap(g => g.records.map(r => r.date)).sort();
  const overallStartDate = allDates[0] || "Unknown";
  const overallEndDate = allDates[allDates.length - 1] || "Unknown";

  const documentDefinition = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 50],

    footer: (currentPage, pageCount) => ({
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: "center",
      margin: [0, 10],
      fontSize: 9
    }),

    content: content,

    styles: {
      title: { fontSize: 16, bold: true },
      sub: { fontSize: 10, marginBottom: 3 },
      totalDuration: { fontSize: 10, marginBottom: 3, bold: true, color: '#2563eb' },
      monthHeader: { fontSize: 14, bold: true, color: '#1f2937' },
      weekHeader: { fontSize: 11, bold: true, color: '#4b5563' },
      totalBlue: { fontSize: 11, bold: true, color: '#2563eb' },
      totalRed: { fontSize: 11, bold: true, color: '#dc2626' },
      targetText: { fontSize: 10, color: '#6b7280' },
      tableHeader: { bold: true, fillColor: '#f3f4f6', fontSize: 10 }
    }
  };

  pdfMake.createPdf(documentDefinition).download(
    `Laporan-Kehadiran-${userGroups.length}-Users-${overallStartDate}-${overallEndDate}.pdf`
  );
}

export async function exportAttendancePDF(filteredData, userInfo) {

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

  const tableBody = [
    ["Tanggal","Masuk", "Keluar"]
  ];

  filteredData.forEach((item) => {
    tableBody.push([
      item.date,
      convertToWIB(item.masuk)+" WIB",
      convertToWIB(item.keluar)+" WIB"
    ]);
  });

  // Ambil tanggal terawal dan terakhir dari filteredData
  const dates = filteredData.map(item => item.date).sort();
  const startDate = dates[0] || "-";
  const endDate = dates[dates.length - 1] || "-";
  const dateRangeText = startDate === endDate 
    ? `Tanggal: ${startDate}` 
    : `Tanggal: ${startDate} s/d ${endDate}`;

  const documentDefinition = {
    pageSize: "A4",
    pageMargins: [40, 100, 40, 50],

    // HEADER: kalau tanggal ada → tampilkan
    header: {
      columns: [
        [
          { text: "Attendance Report", style: "title" },
          { text: `Nama: ${filteredData[0]?.userName || "-"}`, style: "sub" },
          { text: `Email: ${filteredData[0]?.userEmail || "-"}`, style: "sub" },
          { text: dateRangeText, style: "sub" }
        ]
      ],
      margin: [40, 20]
    },

    footer: (currentPage, pageCount) => ({
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: "center",
      margin: [0, 10]
    }),

    content: [
      {
        table: {
          headerRows: 1,
          widths: ["*","*", "*"],
          body: tableBody
        }
      }
    ],

    styles: {
      title: { fontSize: 16, bold: true, marginBottom: 5 },
      sub: { fontSize: 10, marginBottom: 2 }
    }
  };

  pdfMake.createPdf(documentDefinition).download(
    `Presensi-${filteredData[0]?.userName || "Unknown"}-${startDate}-${endDate}.pdf`
  );
}

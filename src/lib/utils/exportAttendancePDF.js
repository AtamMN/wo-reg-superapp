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

  const tableBody = [
    ["Tanggal", "Masuk", "Ket. Masuk", "Keluar", "Ket. Keluar", "Durasi"]
  ];

  filteredData.forEach((item) => {
    tableBody.push([
      item.date,
      convertToWIB(item.masuk)+" WIB",
      item.keteranganMasuk || "-",
      convertToWIB(item.keluar)+" WIB",
      item.keteranganKeluar || "-",
      calculateDuration(item.masuk, item.keluar)
    ]);
  });

  // Ambil tanggal terawal dan terakhir dari filteredData
  const dates = filteredData.map(item => item.date).sort();
  const startDate = dates[0] || "-";
  const endDate = dates[dates.length - 1] || "-";
  const dateRangeText = startDate === endDate 
    ? `Tanggal: ${startDate}` 
    : `Tanggal: ${startDate} s.d. ${endDate}`;

  // Hitung total durasi
  let totalMinutes = 0;
  filteredData.forEach((item) => {
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

  const documentDefinition = {
    pageSize: "A4",
    pageMargins: [40, 100, 40, 50],

    // HEADER: kalau tanggal ada → tampilkan
    header: {
      columns: [
        [
          { text: "Laporan Kehadiran", style: "title" },
          { text: `Nama: ${filteredData[0]?.userName || "-"}`, style: "sub" },
          { text: `Pos-el: ${filteredData[0]?.userEmail || "-"}`, style: "sub" },
          { text: dateRangeText, style: "sub" },
          { text: totalDurationText, style: "sub"}
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
          widths: ["auto", "auto", "*", "auto", "*", "auto"],
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

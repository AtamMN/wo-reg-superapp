"use client";
import { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  checkTodayAttendance,
  saveAttendance,
  formatTimestampWIB,
} from "@/lib/firebase/attendance";
import { useRouter } from "next/navigation";

export default function QRScannerPage() {
  const { currentUser, userRole, loading } = useAuth();
  const router = useRouter();
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [processing, setProcessing] = useState(false);
  const [lastScanned, setLastScanned] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    const getVideoDevices = async () => {
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = mediaDevices.filter(
          (d) => d.kind === "videoinput"
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting devices:", error);
      }
    };

    getVideoDevices();
  }, []);

  const handleScan = async (result) => {
    if (result && !processing) {
      const text =
        result[0]?.rawValue ||
        result.data ||
        result.text ||
        (typeof result === "string" ? result : JSON.stringify(result));

      if (!text) return;

      // Cegah double scan
      if (text === lastScanned) return;

      // Validasi QR
      if (text !== "PRESENSI_2025" && text !== "KELUAR_2025") {
        setMessage({
          type: "error",
          text: "QR tidak valid! Gunakan QR Presensi resmi.",
        });
        setScanning(false); // TUTUP SCANNER
        return;
      }

      setLastScanned(text);
      setProcessing(true);

      // Kirim jenis QR
      await processAttendance(text);

      // Reset anti-spam
      setTimeout(() => {
        setLastScanned("");
        setProcessing(false);
      }, 2000);
    }
  };

  const processAttendance = async (qrType) => {
    try {
      if (!currentUser || !userRole) {
        setMessage({
          type: "error",
          text: "Anda harus login terlebih dahulu",
        });
        setScanning(false);
        return;
      }

      const checkResult = await checkTodayAttendance(currentUser.uid);

      const userName =
        userRole.roleData?.name || currentUser.displayName || currentUser.email;

      // ===== PRESENSI MASUK =====
      if (qrType === "PRESENSI_2025") {
        if (checkResult.exists && checkResult.data?.masuk) {
          const tf = formatTimestampWIB(checkResult.data.masuk);
          setMessage({
            type: "error",
            text: `Anda sudah presensi masuk hari ini pada ${tf} WIB`,
          });
          setScanning(false);
          return;
        }

        const saveResult = await saveAttendance(
          currentUser.uid,
          userName,
          currentUser.email,
          "masuk"
        );

        if (saveResult.success) {
          const tf = formatTimestampWIB(saveResult.timestamp);
          setMessage({
            type: "success",
            text: `✅ Presensi MASUK berhasil pada ${tf} WIB`,
          });
          setScanning(false); // Tutup scanner setelah berhasil
        }
      }

      // ===== PRESENSI KELUAR =====
      else if (qrType === "KELUAR_2025") {
        if (!checkResult.exists || !checkResult.data?.masuk) {
          setMessage({
            type: "error",
            text: "Anda belum presensi masuk hari ini!",
          });
          setScanning(false);
          return;
        }

        if (checkResult.data?.keluar) {
          const tf = formatTimestampWIB(checkResult.data.keluar);
          setMessage({
            type: "error",
            text: `Anda sudah presensi keluar hari ini pada ${tf} WIB`,
          });
          setScanning(false);
          return;
        }

        const saveResult = await saveAttendance(
          currentUser.uid,
          userName,
          currentUser.email,
          "keluar"
        );

        if (saveResult.success) {
          const tf = formatTimestampWIB(saveResult.timestamp);
          setMessage({
            type: "success",
            text: `✅ Presensi KELUAR berhasil pada ${tf} WIB`,
          });
          setScanning(false);
        }
      }
    } catch (error) {
      console.error("Error processing attendance:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan. Silakan coba lagi.",
      });
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="p-4 text-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Presensi QR Scanner</h1>

      <div className="mb-4 text-sm text-gray-600">
        <p>
          Login sebagai:{" "}
          <strong>{userRole?.roleData?.name || currentUser.email}</strong>
        </p>
      </div>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded max-w-md mx-auto ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {!scanning ? (
        <button
          onClick={() => {
            setScanning(true);
            setMessage({ type: "", text: "" });
          }}
          disabled={processing}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mulai Scan Presensi
        </button>
      ) : (
        <>
          <div className="mt-4">
            <label className="block mb-1 font-medium">Pilih Kamera:</label>
            <select
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              value={selectedDeviceId || ""}
              className="p-2 border rounded w-full max-w-md mx-auto"
            >
              {devices.map((device, idx) => (
                <option key={idx} value={device.deviceId}>
                  {device.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>

          {/* Container with 1:1 aspect ratio */}
          <div className="mt-4 mx-auto w-full max-w-md relative h-96">
            <Scanner
              deviceId={selectedDeviceId}
              onScan={handleScan}
              onError={(err) => console.error("Scan error:", err)}
              className="w-full h-full object-cover rounded"
            />
          </div>

          <p className="mt-2 text-sm text-gray-600">
            {processing ? "Memproses..." : "Arahkan kamera ke QR Code"}
          </p>

          <button
            onClick={() => setScanning(false)}
            disabled={processing}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded disabled:opacity-50"
          >
            Berhenti Scan
          </button>
        </>
      )}
    </div>
  );
}

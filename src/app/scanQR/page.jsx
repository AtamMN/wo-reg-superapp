"use client";
import { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function QRScannerPage() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [lastScanned, setLastScanned] = useState("");

  useEffect(() => {
    const getVideoDevices = async () => {
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = mediaDevices.filter((d) => d.kind === "videoinput");
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

  const handleScan = (result) => {
    if (result) {
      // console.log('res: ', result[0].rawValue)
      const text =
        result[0].rawValue ||
        result.data ||
        result.text ||
        (typeof result === "string" ? result : JSON.stringify(result));

      // Prevent scanning same code repeatedly within 1 second
      if (text && text !== lastScanned) {
        setResults((prev) => (prev.includes(text) ? prev : [...prev, text]));
        setLastScanned(text);

        // Clear lastScanned after 1 second to allow re-scanning the same code later
        setTimeout(() => setLastScanned(""), 1000);
      }
    }
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>

      {!scanning ? (
        <button
          onClick={() => setScanning(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Start Scanning
        </button>
      ) : (
        <>
          <div className="mt-4">
            <label className="block mb-1 font-medium">Select Camera:</label>
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
          <div className="mt-4 mx-auto w-full max-w-md relative">
            <Scanner
              deviceId={selectedDeviceId}
              onScan={handleScan}
              onError={(err) => console.error("Scan error:", err)}
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>

          <button
            onClick={() => setScanning(false)}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Stop Scanning
          </button>
        </>
      )}

      {results.length > 0 && (
        <div className="mt-6 max-w-md mx-auto text-left">
          <h2 className="text-lg font-bold text-green-700 mb-2">✅ Scanned Results:</h2>
          <ul className="space-y-2">
            {results.map((res, idx) => (
              <li
                key={idx}
                className="p-2 bg-green-100 text-green-800 rounded break-words"
              >
                {res}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

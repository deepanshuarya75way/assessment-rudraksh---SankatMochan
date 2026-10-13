import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Loader2 } from "lucide-react";
import api from "../../api/axios";

const EmergencyQR = () => {
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQR();
  }, []);

  const fetchQR = async () => {
    try {
      const res = await api.get("/qr");
      setQrUrl(res.data.emergencyUrl);
    } catch (error) {
      console.error("Failed to generate QR:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-slate-400 min-h-[200px] w-full max-w-[220px]">
        <Loader2 className="animate-spin text-cyan-400 mb-2" size={28} />
        <span className="text-xs font-medium">Generating QR...</span>
      </div>
    );
  }

  if (!qrUrl) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl text-center text-rose-400 text-xs">
        QR generation unavailable.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        id="emergency-card-qr"
        className="relative bg-white p-4 rounded-2xl shadow-xl shadow-cyan-950/40 border-2 border-cyan-400/40 group overflow-hidden"
      >
        <QRCode value={qrUrl} size={150} level="H" />
      </div>
      <p className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 mt-2 text-center">
        SCAN TO UNLOCK VITALS
      </p>
    </div>
  );
};

export default EmergencyQR;

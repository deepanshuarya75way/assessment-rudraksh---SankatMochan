import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import api from "../../api/axios";

const QRGenerator = ({ onQRReady }) => {
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateQR = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/qr");
      const url = res.data.emergencyUrl;

      if (!url) {
        throw new Error("QR URL not received from server");
      }

      setQrUrl(url);
      if (onQRReady) {
        onQRReady(url);
      }
    } catch (err) {
      console.error("QR generation error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to generate QR code"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (qrUrl) {
      navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
        <p className="text-slate-400 text-sm font-medium">Generating encrypted QR payload...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 text-center space-y-4">
        <p className="text-rose-400 text-sm font-semibold">{error}</p>
        <button
          onClick={generateQR}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
        >
          <RefreshCw size={14} />
          <span>Retry Generation</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
            <QrCode size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Emergency QR Identity Pass
            </h2>
            <p className="text-xs text-slate-400">
              Scan with any smartphone camera to reveal medical profile
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
          LIVE ACTIVE
        </span>
      </div>

      {/* QR Display Card */}
      <div className="flex flex-col items-center justify-center mt-8">
        <div
          id="emergency-qr"
          className="relative bg-white p-6 rounded-3xl border-2 border-cyan-400/40 shadow-2xl shadow-cyan-950/50 group overflow-hidden"
        >
          <QRCodeSVG value={qrUrl} size={220} level="H" includeMargin={true} />
        </div>
      </div>

      {/* Link Copy Bar */}
      <div className="mt-8 pt-6 border-t border-slate-800/80">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Public Emergency URL Payload
        </p>

        <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
          <span className="text-xs font-mono text-cyan-300 truncate pr-3 select-all">
            {qrUrl}
          </span>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shrink-0"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
import { useState } from 'react';
import { Nfc, X, Check, AlertTriangle, Copy } from 'lucide-react';

export default function NfcWriter({ slug, clientName, onClose }) {
  const url = `${window.location.origin}/${slug}`;
  const supported = typeof window !== 'undefined' && 'NDEFReader' in window;
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');

  const write = async () => {
    setStatus('scanning');
    setErr('');
    try {
      const ndef = new window.NDEFReader();
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 60000);
      await ndef.write({ records: [{ recordType: 'url', data: url }] }, { signal: controller.signal });
      clearTimeout(to);
      setStatus('done');
    } catch (e) {
      setErr(e && e.name === 'AbortError' ? 'انتهى الوقت دون اكتشاف كارت' : (e && e.message) || 'فشل الكتابة على الكارت');
      setStatus('error');
    }
  };

  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&data=${encodeURIComponent(url)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-5" onClick={onClose}>
      <div className="relative bg-[#0c0c0c] border border-[#3D8F73]/30 rounded-2xl p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 left-3 p-1.5 text-neutral-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#3D8F73]/15 flex items-center justify-center text-[#5fbf9c] mb-3">
          <Nfc className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">ربط كارت NFC</h3>
        <p className="text-xs text-neutral-400 mt-1">للعميل: {clientName || slug}</p>

        {supported ? (
          <>
            <div className="mt-4 rounded-xl bg-[#050505] border border-neutral-800 px-3 py-2 text-xs text-neutral-300 break-all" dir="ltr">{url}</div>
            {status === 'idle' && (
              <>
                <p className="text-sm text-neutral-300 mt-4">اضغط ابدأ ثم قرّب الكارت من مؤشر NFC في هاتفك (الجهة الخلفية العلوية غالباً).</p>
                <button onClick={write} className="w-full mt-4 rounded-xl bg-[#3D8F73] hover:bg-[#4ca088] text-white font-semibold py-3 flex items-center justify-center gap-2">
                  <Nfc className="w-5 h-5" /> ابدأ الربط
                </button>
              </>
            )}
            {status === 'scanning' && (
              <div className="mt-5">
                <div className="w-10 h-10 mx-auto border-4 border-neutral-700 border-t-[#3D8F73] rounded-full animate-spin" />
                <p className="text-sm text-neutral-300 mt-3">بانتظار تقريب الكارت…</p>
                <button onClick={() => setStatus('idle')} className="mt-3 text-xs text-neutral-500">إلغاء</button>
              </div>
            )}
            {status === 'done' && (
              <div className="mt-5">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400"><Check className="w-8 h-8" /></div>
                <p className="text-sm text-white mt-3">تم ربط الكارت بنجاح ✅</p>
                <p className="text-xs text-neutral-500 mt-1">عند تمرير الكارت على أي هاتف سيفتح رابط العميل تلقائياً.</p>
                <button onClick={onClose} className="w-full mt-4 rounded-xl bg-neutral-800 text-neutral-200 py-2.5">تم</button>
              </div>
            )}
            {status === 'error' && (
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2 text-red-300"><AlertTriangle className="w-5 h-5" /><span className="text-sm">{err}</span></div>
                <button onClick={write} className="w-full mt-4 rounded-xl bg-[#3D8F73] hover:bg-[#4ca088] text-white font-semibold py-3">إعادة المحاولة</button>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-neutral-300 mt-4">جهازك لا يدعم الكتابة المباشرة على NFC (مثل آيفون أو بعض المتصفحات).</p>
            <p className="text-xs text-neutral-500 mt-2">امسح هذا الرمز بكاميرا الهاتف لفتح الرابط، أو استخدم تطبيق NFC Tools لكتابته على الكارت:</p>
            <img src={qr} alt="QR" className="w-44 h-44 mx-auto mt-4 rounded-xl bg-white p-2" />
            <button onClick={() => { navigator.clipboard.writeText(url).catch(() => {}); }} className="w-full mt-4 rounded-xl bg-neutral-800 text-neutral-200 py-2.5 flex items-center justify-center gap-2">
              <Copy className="w-4 h-4" /> نسخ الرابط
            </button>
          </>
        )}
      </div>
    </div>
  );
}
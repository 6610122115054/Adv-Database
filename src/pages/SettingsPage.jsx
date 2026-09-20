import { useState } from 'react';
import { Info, Database, Cloud, Server, RefreshCw, Bell, UserRound, ShieldCheck, Save, RotateCcw, CircleCheck, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 1. ค่าตั้งของหน้านี้เก็บในเบราว์เซอร์เท่านั้น ไม่มีรหัสผ่านหรือ API key
const STORAGE_KEY = 'tiktok-travel-trends:settings:v1';
const thresholds = [50, 70, 80, 90];
const defaultSettings = () => ({
  profile: { name: 'ผู้ใช้งานตัวอย่าง', email: 'student@example.com' },
  alerts: { trends: true, quota: true },
  quotaThreshold: 80,
});

// อ่านข้อมูลเดิมอย่างปลอดภัย หากข้อมูลเสียหรือเบราว์เซอร์บล็อก storage ยังเปิดหน้าได้
function loadSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { value: defaultSettings(), notice: null };
    const stored = JSON.parse(raw);
    if (!stored || stored.version !== 1
      || typeof stored.profile?.name !== 'string' || !stored.profile.name.trim() || stored.profile.name.length > 80
      || typeof stored.profile?.email !== 'string' || !stored.profile.email.trim() || stored.profile.email.length > 120
      || typeof stored.alerts?.trends !== 'boolean' || typeof stored.alerts?.quota !== 'boolean'
      || !thresholds.includes(stored.quotaThreshold)) throw new Error('Invalid settings');
    return {
      value: {
        profile: { name: stored.profile.name.trim(), email: stored.profile.email.trim() },
        alerts: { trends: stored.alerts.trends, quota: stored.alerts.quota },
        quotaThreshold: stored.quotaThreshold,
      },
      notice: null,
    };
  } catch {
    return { value: defaultSettings(), notice: { type: 'error', text: 'อ่านค่าที่บันทึกไว้ไม่ได้ จึงแสดงค่าเริ่มต้น คุณยังแก้ไขและลองบันทึกใหม่ได้' } };
  }
}

// ปล่อยให้ผู้เรียกจัดการข้อผิดพลาด เพื่อไม่แสดงว่าบันทึกสำเร็จเมื่อ storage ใช้ไม่ได้
function persistSettings(value) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...value }));
}

// ข้อมูล API จำลอง ไม่ได้เรียก API หรือสร้างค่าใช้จ่ายจริง
const apiUsage = [
  { date: '14 ก.ย.', requests: 3000 }, { date: '15 ก.ย.', requests: 4100 },
  { date: '16 ก.ย.', requests: 4500 }, { date: '17 ก.ย.', requests: 5300 },
  { date: '18 ก.ย.', requests: 7200 }, { date: '19 ก.ย.', requests: 7900 },
  { date: '20 ก.ย.', requests: 8400 },
];
const dailyQuota = 10000;
const examplePricePerThousand = 0.2;
const number = (value) => new Intl.NumberFormat('en-US').format(value);
const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500';

function Panel({ title, subtitle, icon: Icon, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-bold text-slate-800"><Icon size={19} className="text-blue-600" aria-hidden="true" />{title}</h2>
      <p className="mb-5 mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p>
      {children}
    </section>
  );
}

function ToggleRow({ id, title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
      <div><p id={`${id}-label`} className="text-sm font-semibold text-slate-700">{title}</p><p id={`${id}-description`} className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p></div>
      <button type="button" role="switch" aria-checked={checked} aria-labelledby={`${id}-label`} aria-describedby={`${id}-description`} onClick={onChange} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}><span className={`absolute left-0 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} /></button>
    </div>
  );
}

// 2. ฟอร์มใช้ useState เก็บค่าระหว่างแก้ไข กดบันทึกจึงเก็บไว้ใน localStorage
export default function SettingsPage() {
  const [initial] = useState(loadSettings);
  const [draft, setDraft] = useState(initial.value);
  const [saved, setSaved] = useState(initial.value);
  const [feedback, setFeedback] = useState(initial.notice);
  const [lastCheck, setLastCheck] = useState(null);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const latestUsage = apiUsage[apiUsage.length - 1].requests;
  const usagePercent = latestUsage / dailyQuota * 100;
  const totalRequests = apiUsage.reduce((total, day) => total + day.requests, 0);
  const sampleCost = totalRequests / 1000 * examplePricePerThousand;
  const showQuotaAlert = draft.alerts.quota && usagePercent >= draft.quotaThreshold;

  function updateProfile(key, value) {
    setDraft((previous) => ({ ...previous, profile: { ...previous.profile, [key]: value } }));
    setFeedback(null);
  }

  function toggleAlert(key) {
    setDraft((previous) => ({ ...previous, alerts: { ...previous.alerts, [key]: !previous.alerts[key] } }));
    setFeedback(null);
  }

  function saveSettings(event) {
    event.preventDefault();
    const next = { ...draft, profile: { name: draft.profile.name.trim(), email: draft.profile.email.trim() } };
    if (!next.profile.name || !next.profile.email) {
      setFeedback({ type: 'error', text: 'กรุณากรอกชื่อที่แสดงและอีเมลให้ครบ' });
      return;
    }
    try {
      persistSettings(next);
      setDraft(next);
      setSaved(next);
      setFeedback({ type: 'success', text: 'บันทึกการตั้งค่าในเบราว์เซอร์นี้แล้ว เมื่อรีเฟรชหรือกลับมาที่หน้านี้ ข้อมูลจะยังอยู่' });
    } catch {
      setFeedback({ type: 'error', text: 'บันทึกไม่ได้ เบราว์เซอร์อาจปิดกั้นการจัดเก็บหรือพื้นที่เต็ม ค่าที่แก้ไขยังอยู่ในฟอร์ม แต่ยังไม่ถูกบันทึก' });
    }
  }

  function resetDraft() {
    setDraft(defaultSettings());
    setFeedback({ type: 'info', text: 'คืนค่าเริ่มต้นในฟอร์มแล้ว กดบันทึกการตั้งค่าเพื่อเก็บค่าใหม่' });
  }

  function checkSampleData() {
    const valid = apiUsage.length > 0 && apiUsage.every((day) => Number.isFinite(day.requests) && day.requests >= 0);
    if (!valid) {
      setFeedback({ type: 'error', text: 'ข้อมูลตัวอย่างไม่พร้อมใช้งาน' });
      return;
    }
    setLastCheck(new Intl.DateTimeFormat('th-TH', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Bangkok' }).format(new Date()));
    setFeedback({ type: 'info', text: `ตรวจข้อมูลตัวอย่าง ${apiUsage.length} วันสำเร็จ การตรวจนี้ไม่ได้ติดต่อ API หรือฐานข้อมูลภายนอก` });
  }

  return (
    <form onSubmit={saveSettings} className="min-w-0 space-y-6 p-4 lg:p-8">
      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-800"><Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" /><p>ตั้งค่าโปรไฟล์และตัวอย่างแจ้งเตือนสำหรับหน้านี้ บันทึกไว้ในเบราว์เซอร์ที่ใช้อยู่ · การเชื่อมต่อ API ฐานข้อมูล และสถิติการใช้งานยังเป็นส่วนสาธิต</p></div>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Panel title="DATA SOURCE CONNECTIVITY" subtitle="สถานะของแหล่งข้อมูลสำหรับหน้าเว็บตัวอย่าง" icon={Database}>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Database size={18} aria-hidden="true" />ข้อมูลตัวอย่าง</p><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">พร้อมใช้งาน</span></div><p className="mt-2 text-xs leading-relaxed text-slate-500">ชุดข้อมูลจำลองที่มากับหน้าเว็บ สำหรับทดลองแสดงผล</p></div>
            <div className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Cloud size={18} aria-hidden="true" />TikTok API</p><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">ยังไม่เชื่อมต่อ</span></div><p className="mt-2 text-xs leading-relaxed text-slate-500">รอเพิ่มระบบหลังบ้านเพื่อเชื่อมบัญชีและดึงข้อมูลจริง</p></div>
            <div className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Server size={18} aria-hidden="true" />ฐานข้อมูลกลาง</p><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">ยังไม่เชื่อมต่อ</span></div><p className="mt-2 text-xs leading-relaxed text-slate-500">ข้อมูลที่บันทึกในหน้านี้ยังไม่ซิงก์ข้ามเครื่องหรือข้ามผู้ใช้</p></div>
          </div>
          <button type="button" onClick={checkSampleData} className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100"><RefreshCw size={16} aria-hidden="true" />ตรวจข้อมูลตัวอย่าง</button>
          <p className="mt-2 text-xs text-slate-500">{lastCheck ? `ตรวจล่าสุด: ${lastCheck} (เวลาไทย)` : 'ยังไม่ได้ตรวจข้อมูลตัวอย่างในรอบนี้'}</p>
        </Panel>

        <Panel title="API USAGE & COST" subtitle="การใช้งานและค่าใช้จ่ายจำลอง · 14–20 กันยายน 2569" icon={Cloud}>
          <div className="mb-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">คำขอรวม 7 วัน</p><p className="mt-1 text-2xl font-bold text-slate-800">{number(totalRequests)}</p></div><div className="rounded-xl bg-blue-50 p-3"><p className="text-xs text-slate-500">ค่าใช้จ่ายตัวอย่าง</p><p className="mt-1 text-2xl font-bold text-blue-700">฿{sampleCost.toFixed(2)}</p></div></div>
          <div className="h-44 min-w-0"><ResponsiveContainer width="100%" height="100%" minWidth={0}><BarChart data={apiUsage} margin={{ top: 8, right: 10, left: 0, bottom: 0 }} accessibilityLayer><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} /><YAxis tickFormatter={(value) => `${value / 1000}K`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={32} /><Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} formatter={(value) => [`${number(value)} คำขอ`, 'การใช้งานตัวอย่าง']} /><Bar dataKey="requests" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} /></BarChart></ResponsiveContainer></div>
          <div className="mt-4"><div className="mb-2 flex flex-wrap justify-between gap-1 text-xs text-slate-600"><span>โควตาวันล่าสุดในชุดตัวอย่าง</span><span>{number(latestUsage)} / {number(dailyQuota)} คำขอ ({usagePercent}%)</span></div><div role="progressbar" aria-label="โควตาวันล่าสุดในชุดตัวอย่าง" aria-valuemin={0} aria-valuemax={100} aria-valuenow={usagePercent} className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(usagePercent, 100)}%` }} /></div></div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">สมมติราคา 0.20 บาทต่อ 1,000 คำขอสำหรับสาธิตการคำนวณ ไม่ใช่อัตราค่าบริการจริงของ TikTok และไม่มีการเรียกเก็บเงิน</p>
        </Panel>

        <Panel title="ALERTS & NOTIFICATIONS" subtitle="เลือกเงื่อนไขแล้วดูตัวอย่างการแจ้งเตือนด้านล่าง" icon={Bell}>
          <div className="space-y-3">
            <ToggleRow id="trend-alert" title="แจ้งเตือนกระแสใหม่" description="แสดงตัวอย่างเมื่อพบแฮชแท็กที่น่าสนใจ" checked={draft.alerts.trends} onChange={() => toggleAlert('trends')} />
            <ToggleRow id="quota-alert" title="แจ้งเตือนโควตาใกล้เต็ม" description="แสดงตัวอย่างเมื่อการใช้งานถึงเกณฑ์ที่เลือก" checked={draft.alerts.quota} onChange={() => toggleAlert('quota')} />
            <label className="block space-y-1.5 text-sm font-medium text-slate-700"><span>แจ้งเตือนเมื่อใช้โควตาถึง</span><select value={draft.quotaThreshold} disabled={!draft.alerts.quota} onChange={(event) => { setDraft((previous) => ({ ...previous, quotaThreshold: Number(event.target.value) })); setFeedback(null); }} className={`${fieldClass} disabled:cursor-not-allowed disabled:bg-slate-100`}>{thresholds.map((value) => <option key={value} value={value}>{value}%</option>)}</select></label>
          </div>
          <div className="mt-4 space-y-2" aria-live="polite"><p className="text-xs font-semibold text-slate-500">ตัวอย่างการแสดงแจ้งเตือน</p>{draft.alerts.trends && <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-800">ตัวอย่าง: พบแฮชแท็กที่เติบโตในชุดข้อมูลจำลอง</p>}{showQuotaAlert && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">ตัวอย่าง: ใช้โควตา {usagePercent}% ถึงเกณฑ์แจ้งเตือน {draft.quotaThreshold}% แล้ว</p>}{!draft.alerts.trends && !showQuotaAlert && <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">ไม่มีการแจ้งเตือนตัวอย่างตามเงื่อนไขที่เลือก</p>}</div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">สวิตช์มีผลกับตัวอย่างในหน้านี้ ยังไม่มีการส่งอีเมลหรือแจ้งเตือนภายนอก</p>
        </Panel>

        <Panel title="USER PROFILE & ACCESS" subtitle="โปรไฟล์ตัวอย่างที่บันทึกในเบราว์เซอร์นี้" icon={UserRound}>
          <div className="mb-5 flex items-center gap-3"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">{draft.profile.name.trim().slice(0, 1) || 'U'}</span><div className="min-w-0"><p className="break-words font-semibold text-slate-800">{draft.profile.name.trim() || 'ผู้ใช้งาน'}</p><p className="break-all text-xs text-slate-500">{draft.profile.email}</p></div></div>
          <div className="space-y-4">
            <label className="block space-y-1.5 text-sm font-medium text-slate-700"><span>ชื่อที่แสดง</span><input type="text" required maxLength={80} autoComplete="name" value={draft.profile.name} onChange={(event) => updateProfile('name', event.target.value)} className={fieldClass} /></label>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700"><span>อีเมล</span><input type="email" required maxLength={120} autoComplete="email" value={draft.profile.email} onChange={(event) => updateProfile('email', event.target.value)} className={fieldClass} /></label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="flex items-center gap-2 text-sm font-medium text-slate-700"><ShieldCheck size={17} aria-hidden="true" />บทบาทตัวอย่าง: ผู้ดูแลระบบ</p><p className="mt-1 text-xs leading-relaxed text-slate-500">ใช้แสดงหน้าจอเท่านั้น ยังไม่มีระบบเข้าสู่ระบบหรือกำหนดสิทธิ์จริง</p></div>
          </div>
        </Panel>
      </div>

      {feedback && <div role={feedback.type === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm leading-relaxed ${feedback.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>{feedback.type === 'error' ? <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" /> : <CircleCheck size={18} className="mt-0.5 shrink-0" aria-hidden="true" />}<p>{feedback.text}</p></div>}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className={`text-sm ${isDirty ? 'text-amber-700' : 'text-slate-500'}`}>{isDirty ? 'มีการแก้ไขที่ยังไม่ได้บันทึก' : 'กดบันทึกเพื่อเก็บโปรไฟล์และค่าตัวเลือกไว้ในเบราว์เซอร์นี้'}</p>
        <div className="flex flex-wrap gap-3"><button type="button" onClick={resetDraft} className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"><RotateCcw size={16} aria-hidden="true" />คืนค่าเริ่มต้น</button><button type="submit" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"><Save size={16} aria-hidden="true" />บันทึกการตั้งค่า</button></div>
      </div>
    </form>
  );
}

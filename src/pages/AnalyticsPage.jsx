import { useId, useState } from 'react';
import { Eye, Clock3, CircleCheck, Bookmark, RotateCcw, Info } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';

// 1. ข้อมูลสมมติสำหรับฝึกทำหน้าเว็บ ไม่ใช่ข้อมูลจริงจาก TikTok
// มี 30 วัน (22 ส.ค. - 20 ก.ย. 2026) และ 3 หมวด โดยคลิปตัวอย่างยาว 45 วินาที
const categories = ['ทะเล', 'คาเฟ่', 'ธรรมชาติ'];
const demoData = Array.from({ length: 30 }, (_, day) => (
  categories.map((category, index) => {
    const date = new Date(Date.UTC(2026, 7, 22 + day)).toISOString().slice(0, 10);
    const views = 3600 + day * 97 + index * 541 + (day % 7) * 180;
    const variation = (day % 5) * 0.008;
    const quarter = Math.round(views * (0.86 - index * 0.025 + variation));
    const half = Math.round(views * (0.67 - index * 0.03 + variation));
    const threeQuarter = Math.round(views * (0.48 - index * 0.03 + variation));
    const completed = Math.round(views * (0.36 - index * 0.025 + variation));
    const ideas = Math.round(views * (0.36 + index * 0.025 + variation / 2));
    const planning = Math.round(views * (0.28 - index * 0.02));
    const research = Math.round(views * (0.19 + variation / 2));
    return {
      day, date, category, views, quarter, half, threeQuarter, completed,
      // จำลองเวลารับชมรวมจากเส้นอัตราดูต่อ ใช้ค่านี้หาเฉลี่ยแบบถ่วงน้ำหนัก
      watchSeconds: Math.round((45 / 8) * (views + 2 * quarter + 2 * half + 2 * threeQuarter + completed)),
      saves: Math.round(views * (0.054 + index * 0.008 + variation / 4)),
      shares: Math.round(views * (0.023 + index * 0.004 + variation / 5)),
      locationClicks: Math.round(views * (0.071 - index * 0.009 + variation / 3)),
      follows: Math.round(views * (0.014 + index * 0.003 + variation / 6)),
      ideas, planning, research,
      entertainment: views - ideas - planning - research,
    };
  })
)).flat();

const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
const percent = (value, total) => total ? Number(((value / total) * 100).toFixed(1)) : 0;
const number = (value) => new Intl.NumberFormat('en-US').format(value);
const shortDate = (date) => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
const tooltipStyle = { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 };
const fieldClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500';

// 2. ส่วนประกอบที่ใช้ซ้ำ: กล่องตัวเลขสรุป และกรอบกราฟ
function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="rounded-lg bg-blue-50 p-2 text-blue-600"><Icon size={19} aria-hidden="true" /></span>
      </div>
      <p className="text-3xl font-bold tabular-nums text-slate-800">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{detail}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children, note }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-slate-800">{title}</h2>
      <p className="mb-5 mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p>
      {children}
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">{note}</p>
    </section>
  );
}

// 3. หน้าหลัก: useState เก็บตัวเลือก และคำนวณกราฟใหม่เมื่อผู้ใช้เปลี่ยนค่า
export default function AnalyticsPage() {
  const [period, setPeriod] = useState(7);
  const [category, setCategory] = useState('all');
  const gradientId = useId();
  const rows = demoData.filter((row) => row.day >= 30 - period && (category === 'all' || row.category === category));
  const totalViews = sum(rows, 'views');
  const averageWatchTime = totalViews ? sum(rows, 'watchSeconds') / totalViews : 0;
  const completionRate = percent(sum(rows, 'completed'), totalViews);
  const saveRate = percent(sum(rows, 'saves'), totalViews);

  // เวลาเฉลี่ยแต่ละวัน = เวลารับชมรวมของวันนั้น / ยอดรับชมของวันนั้น
  const dailyTotals = rows.reduce((result, row) => {
    const previous = result[row.date] || { views: 0, watchSeconds: 0 };
    result[row.date] = { views: previous.views + row.views, watchSeconds: previous.watchSeconds + row.watchSeconds };
    return result;
  }, {});
  const watchTimeData = Object.entries(dailyTotals).map(([date, totals]) => ({
    date: shortDate(date), seconds: Number((totals.watchSeconds / totals.views).toFixed(1)),
  }));
  const retentionData = [
    { progress: 'เริ่มดู', rate: totalViews ? 100 : 0 },
    { progress: '25%', rate: percent(sum(rows, 'quarter'), totalViews) },
    { progress: '50%', rate: percent(sum(rows, 'half'), totalViews) },
    { progress: '75%', rate: percent(sum(rows, 'threeQuarter'), totalViews) },
    { progress: 'จบคลิป', rate: completionRate },
  ];
  const actionData = [
    { action: 'กดดูพิกัด', count: sum(rows, 'locationClicks') },
    { action: 'บันทึกคลิป', count: sum(rows, 'saves') },
    { action: 'แชร์คลิป', count: sum(rows, 'shares') },
    { action: 'กดติดตาม', count: sum(rows, 'follows') },
  ].map((item) => ({ ...item, rate: percent(item.count, totalViews) })).sort((a, b) => b.count - a.count);
  const segmentData = [
    { name: 'เก็บไอเดียท่องเที่ยว', value: sum(rows, 'ideas'), color: '#2563eb' },
    { name: 'วางแผนเที่ยว', value: sum(rows, 'planning'), color: '#14b8a6' },
    { name: 'ค้นหาข้อมูลเพิ่ม', value: sum(rows, 'research'), color: '#38bdf8' },
    { name: 'ชมเพื่อความเพลิดเพลิน', value: sum(rows, 'entertainment'), color: '#818cf8' },
  ];
  const dateRange = `${shortDate(rows[0].date)} – ${shortDate(rows[rows.length - 1].date)} 2569`;

  return (
    <div className="min-w-0 space-y-6 p-4 lg:p-8">
      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-800">
        <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>ข้อมูลตัวอย่างสำหรับฝึกทำหน้า Analytics · สถิติและกลุ่มพฤติกรรมเป็นข้อมูลสมมติ ยังไม่ได้เชื่อมต่อ TikTok หรือฐานข้อมูล</p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">ภาพรวมพฤติกรรมการรับชม</h2>
          <p className="mt-1 text-sm text-slate-500">ช่วงข้อมูลตัวอย่าง: {dateRange}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            <span>ช่วงเวลา</span>
            <select value={period} onChange={(event) => setPeriod(Number(event.target.value))} className={fieldClass}>
              <option value={7}>7 วันสุดท้ายของชุดตัวอย่าง</option>
              <option value={30}>30 วันทั้งหมด</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            <span>หมวดคอนเทนต์</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}>
              <option value="all">ทั้งหมด</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => { setPeriod(7); setCategory('all'); }} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"><RotateCcw size={16} aria-hidden="true" />รีเซ็ต</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite" aria-atomic="true">
        <MetricCard label="ยอดรับชม" value={number(totalViews)} detail="จำนวนครั้งในช่วงเวลาและหมวดที่เลือก" icon={Eye} />
        <MetricCard label="เวลาดูเฉลี่ย" value={`${averageWatchTime.toFixed(1)} วินาที`} detail="คลิปตัวอย่างมีความยาว 45 วินาที" icon={Clock3} />
        <MetricCard label="อัตราดูจบ" value={`${completionRate}%`} detail="ยอดดูจบ ÷ ยอดเริ่มรับชม × 100" icon={CircleCheck} />
        <MetricCard label="อัตราบันทึกคลิป" value={`${saveRate}%`} detail={`${number(sum(rows, 'saves'))} ครั้ง จากยอดรับชมที่เลือก`} icon={Bookmark} />
      </div>

      {/* 4. กราฟทั้งสี่ส่วน ใช้ Recharts ที่โปรเจกต์ติดตั้งอยู่แล้ว */}
      <div className="grid items-stretch gap-6 xl:grid-cols-2">
        <ChartCard title="AVERAGE WATCH TIME" subtitle="เวลาดูเฉลี่ยในแต่ละวัน (วินาที)" note={`เวลาดูเฉลี่ยทั้งช่วง ${averageWatchTime.toFixed(1)} วินาที คำนวณจากเวลารับชมรวม ÷ ยอดรับชมรวม`}>
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={watchTimeData} margin={{ top: 12, right: 18, left: 0, bottom: 0 }} accessibilityLayer>
                <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis domain={[0, 45]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} วินาที`, 'เวลาดูเฉลี่ย']} />
                <Area type="monotone" dataKey="seconds" stroke="#2563eb" strokeWidth={3} fill={`url(#${gradientId})`} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="RETENTION RATE" subtitle="สัดส่วนการรับชมที่ดำเนินต่อถึงแต่ละช่วงของคลิป" note={`เริ่มดูคิดเป็น 100% และดูต่อจนจบ ${completionRate}% ของยอดเริ่มรับชม`}>
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={retentionData} margin={{ top: 22, right: 12, left: 0, bottom: 0 }} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="progress" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} formatter={(value) => [`${value}%`, 'ยังดูต่อ']} />
                <Bar dataKey="rate" fill="#14b8a6" radius={[5, 5, 0, 0]} maxBarSize={48} isAnimationActive={false}>
                  <LabelList dataKey="rate" position="top" formatter={(value) => `${value}%`} style={{ fontSize: 11, fill: '#475569' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="CALL-TO-ACTION EFFECTIVENESS" subtitle="อัตราการตอบสนองต่อการชวนให้ทำสิ่งต่าง ๆ ในคลิป" note="อัตรา = จำนวนการกระทำ ÷ ยอดรับชม × 100 การรับชมหนึ่งครั้งอาจมีหลายการกระทำ">
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={actionData} layout="vertical" margin={{ top: 4, right: 45, left: 0, bottom: 0 }} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 12]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="action" width={88} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} formatter={(value, _name, item) => [`${value}% (${number(item.payload.count)} ครั้ง)`, 'อัตราตอบสนอง']} />
                <Bar dataKey="rate" fill="#2563eb" radius={[0, 5, 5, 0]} maxBarSize={28} isAnimationActive={false}>
                  <LabelList dataKey="rate" position="right" formatter={(value) => `${value}%`} style={{ fontSize: 11, fill: '#475569' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="BEHAVIORAL SEGMENTATION" subtitle="สัดส่วนการรับชมตามกลุ่มพฤติกรรมสมมติ" note="กลุ่มพฤติกรรมเป็นการจำลองเพื่อแสดงกราฟ หน่วยคือครั้งของการรับชม ไม่ใช่จำนวนผู้ชมที่ไม่ซ้ำกัน">
          <div className="grid items-center gap-3 sm:grid-cols-2">
            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart accessibilityLayer>
                  <Pie data={segmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="56%" outerRadius="82%" paddingAngle={3} stroke="none" isAnimationActive={false}>
                    {segmentData.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${number(value)} ครั้ง (${percent(value, totalViews)}%)`, name]} />
                  <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" fill="#1e293b" fontSize={24} fontWeight="bold">100%</text>
                  <text x="50%" y="59%" textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize={12}>การรับชมทั้งหมด</text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-4">
              {segmentData.map((item) => (
                <li key={item.name} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700">{item.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{number(item.value)} ครั้ง · {percent(item.value, totalViews)}%</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

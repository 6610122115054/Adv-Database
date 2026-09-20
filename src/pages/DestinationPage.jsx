import { useState } from 'react';
import { Info, MapPin, Eye, Heart, Film, Clock3, Music2, RotateCcw } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 1. ข้อมูลสมมติสำหรับฝึกทำหน้าจอ ไม่ใช่สถิติจริงจาก TikTok
const destinations = [
  { id: 'krabi', name: 'กระบี่', description: 'ทะเล เกาะ และธรรมชาติ', tags: ['กระบี่', 'ทะเล', 'เที่ยวไทย'], peak: 4, rate: 7.1, ages: [0.18, 0.35, 0.3] },
  { id: 'chiangmai', name: 'เชียงใหม่', description: 'คาเฟ่ ภูเขา และทริปพักผ่อน', tags: ['เชียงใหม่', 'คาเฟ่', 'ธรรมชาติ'], peak: 3, rate: 8.2, ages: [0.23, 0.36, 0.25] },
  { id: 'phuket', name: 'ภูเก็ต', description: 'ชายหาด เมืองเก่า และไลฟ์สไตล์', tags: ['ภูเก็ต', 'ทะเล', 'คาเฟ่'], peak: 5, rate: 7.8, ages: [0.16, 0.29, 0.32] },
  { id: 'khaoyai', name: 'เขาใหญ่', description: 'ธรรมชาติ คาเฟ่ และทริปใกล้กรุง', tags: ['เขาใหญ่', 'ธรรมชาติ', 'เที่ยวไทย'], peak: 0, rate: 6.5, ages: [0.15, 0.28, 0.34] },
];
const ageGroups = ['18–20', '21–23', '24–26', '27–29'];
const weekdays = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสฯ', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
const timeSlots = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
const audios = [
  { id: 'weekend', name: 'Weekend Escape', description: 'เสียงสมมติสำหรับทริปท่องเที่ยว' },
  { id: 'coffee', name: 'Coffee Break', description: 'เสียงสมมติสำหรับคาเฟ่และไลฟ์สไตล์' },
  { id: 'mountain', name: 'Mountain Morning', description: 'เสียงสมมติสำหรับบรรยากาศธรรมชาติ' },
];

// จำลอง 30 วัน × 4 สถานที่ × 6 ช่วงเวลา หนึ่งแถวแทนหนึ่งคลิปตัวอย่าง
const demoVideos = Array.from({ length: 30 }, (_, day) => destinations.flatMap((destination, placeIndex) => (
  timeSlots.map((time, slotIndex) => {
    const date = new Date(Date.UTC(2026, 7, 22 + day));
    const weekday = (date.getUTCDay() + 6) % 7;
    const views = 1200 + placeIndex * 360 + day * 37 + slotIndex * 105 + (weekday >= 5 ? 400 : 0) + (slotIndex === destination.peak ? 900 : 0);
    const rate = destination.rate + (weekday >= 5 ? 0.3 : 0) + (slotIndex === destination.peak ? 0.9 : 0) + (day % 5) * 0.08;
    const counts = destination.ages.map((weight) => Math.floor(views * weight));
    counts.push(views - counts.reduce((total, value) => total + value, 0));
    return {
      day, date: date.toISOString().slice(0, 10), weekday, time,
      destinationId: destination.id, views, actions: Math.round(views * rate / 100),
      audioId: audios[(day + placeIndex + slotIndex) % audios.length].id,
      demographics: counts.map((total, ageIndex) => {
        const female = Math.round(total * (0.56 + placeIndex * 0.02));
        const male = Math.round(total * (0.39 - placeIndex * 0.01));
        return { age: ageGroups[ageIndex], female, male, unspecified: total - female - male };
      }),
    };
  })
))).flat();

const number = (value) => new Intl.NumberFormat('en-US').format(value);
const compact = (value) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
const shortDate = (date) => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
const fieldClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
const tooltipStyle = { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 };

function summarize(videos) {
  const views = videos.reduce((total, video) => total + video.views, 0);
  const actions = videos.reduce((total, video) => total + video.actions, 0);
  return { views, actions, clips: videos.length, rate: views ? Number((actions / views * 100).toFixed(1)) : 0 };
}

function MetricCard({ title, value, detail, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2"><p className="text-sm text-slate-500">{title}</p><span className="rounded-lg bg-blue-50 p-2 text-blue-600"><Icon size={19} aria-hidden="true" /></span></div>
      <p className="text-2xl font-bold tabular-nums text-slate-800">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{detail}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-slate-800">{title}</h2>
      <p className="mb-5 mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p>
      {children}
    </section>
  );
}

// 2. หน้า Destination: เปลี่ยนสถานที่หรือช่วงเวลาแล้วคำนวณข้อมูลใหม่
export default function DestinationPage() {
  const [destinationId, setDestinationId] = useState('krabi');
  const [period, setPeriod] = useState(7);
  const [selectedCell, setSelectedCell] = useState(null);
  const destination = destinations.find((item) => item.id === destinationId);
  const periodVideos = demoVideos.filter((video) => video.day >= 30 - period);
  const videos = periodVideos.filter((video) => video.destinationId === destinationId);
  const summary = summarize(videos);
  const dateRange = `${shortDate(videos[0].date)} – ${shortDate(videos[videos.length - 1].date)} 2569`;
  const demographics = ageGroups.map((age, index) => videos.reduce((result, video) => ({
    age, female: result.female + video.demographics[index].female,
    male: result.male + video.demographics[index].male,
    unspecified: result.unspecified + video.demographics[index].unspecified,
  }), { age, female: 0, male: 0, unspecified: 0 }));
  const heatmap = weekdays.flatMap((day, weekday) => timeSlots.map((time) => ({
    key: `${weekday}-${time}`, day, time,
    ...summarize(videos.filter((video) => video.weekday === weekday && video.time === time)),
  })));
  const peak = [...heatmap].sort((a, b) => b.rate - a.rate || b.views - a.views)[0];
  const activeCell = heatmap.find((cell) => cell.key === selectedCell);
  const audioData = audios.map((audio) => ({ ...audio, ...summarize(videos.filter((video) => video.audioId === audio.id)) })).sort((a, b) => b.views - a.views);
  const comparison = destinations.map((item) => ({ ...item, ...summarize(periodVideos.filter((video) => video.destinationId === item.id)) })).sort((a, b) => b.views - a.views);

  function resetAll() {
    setDestinationId('krabi');
    setPeriod(7);
    setSelectedCell(null);
  }

  return (
    <div className="min-w-0 space-y-6 p-4 lg:p-8">
      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-800"><Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" /><p>ข้อมูลตัวอย่างสำหรับฝึกทำหน้า Destination Analysis · สถิติประชากร ช่วงเวลา และเสียงเป็นข้อมูลสมมติ ยังไม่ได้เชื่อมต่อ TikTok</p></div>

      <div className="flex flex-wrap items-end justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-blue-100 p-4 text-blue-600"><MapPin size={30} aria-hidden="true" /></div>
          <div><h2 className="text-xl font-bold text-slate-800">{destination.name}</h2><p className="mt-1 text-sm text-slate-500">{destination.description}</p><p className="mt-2 text-xs text-blue-600">{destination.tags.map((tag) => `#${tag}`).join(' ')}</p><p className="mt-2 text-xs text-slate-500">ช่วงข้อมูลตัวอย่าง: {dateRange}</p></div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700"><span>สถานที่</span><select value={destinationId} onChange={(event) => setDestinationId(event.target.value)} className={fieldClass}>{destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700"><span>ช่วงเวลา</span><select value={period} onChange={(event) => setPeriod(Number(event.target.value))} className={fieldClass}><option value={7}>7 วันสุดท้ายของชุดตัวอย่าง</option><option value={30}>30 วันทั้งหมด</option></select></label>
          <button type="button" onClick={resetAll} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"><RotateCcw size={16} aria-hidden="true" />รีเซ็ต</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite" aria-atomic="true">
        <MetricCard title="ยอดรับชม" value={number(summary.views)} detail={`ยอดรับชมคลิปตัวอย่างของ${destination.name}`} icon={Eye} />
        <MetricCard title="อัตรามีส่วนร่วม (ER)" value={`${summary.rate}%`} detail="ไลก์ คอมเมนต์ แชร์ และบันทึก เทียบกับยอดดู" icon={Heart} />
        <MetricCard title="คลิปที่วิเคราะห์" value={`${summary.clips} คลิป`} detail={`ข้อมูล ${period} วันในสถานที่ที่เลือก`} icon={Film} />
        <MetricCard title="ช่วงที่ ER สูงสุด" value={`${peak.day} ${peak.time}`} detail={`ER ${peak.rate}% ในข้อมูลตัวอย่าง`} icon={Clock3} />
      </div>

      <div className="grid items-stretch gap-6 xl:grid-cols-2">
        <Panel title="AUDIENCE DEMOGRAPHICS" subtitle="การรับชมจำลองแยกตามช่วงอายุและเพศ (หน่วย: ครั้ง)">
          <div className="h-72 min-w-0"><ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={demographics} margin={{ top: 12, right: 10, left: 0, bottom: 0 }} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="age" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={compact} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${number(value)} ครั้ง`, name]} labelFormatter={(value) => `อายุ ${value} ปี`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="female" name="หญิง" fill="#2563eb" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="male" name="ชาย" fill="#14b8a6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="unspecified" name="ไม่ระบุ" fill="#94a3b8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer></div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">ตัวเลขเป็นครั้งของการรับชมในชุดตัวอย่าง ไม่ใช่จำนวนผู้ชมที่ไม่ซ้ำกัน</p>
        </Panel>

        <Panel title="ENGAGEMENT HEATMAP BY TIME" subtitle="ER ตามวันและช่วงเวลา (เวลาไทย) · กดช่องเพื่อดูรายละเอียด">
          <div className="overflow-x-auto"><table className="w-full min-w-[390px] border-separate border-spacing-1 text-center text-xs">
            <caption className="sr-only">อัตรามีส่วนร่วมของ{destination.name}ในแต่ละวันและเวลา หน่วยเปอร์เซ็นต์</caption>
            <thead><tr><th scope="col" className="p-1 text-left font-medium text-slate-500">วัน / เวลา</th>{timeSlots.map((time) => <th key={time} scope="col" className="p-1 font-medium text-slate-500">{time}</th>)}</tr></thead>
            <tbody>{weekdays.map((day, dayIndex) => <tr key={day}><th scope="row" className="pr-2 text-left font-medium text-slate-600">{day}</th>{heatmap.slice(dayIndex * timeSlots.length, (dayIndex + 1) * timeSlots.length).map((cell) => {
              const dark = cell.rate >= 8;
              const backgroundColor = cell.rate >= 9 ? '#1e40af' : dark ? '#2563eb' : cell.rate >= 7 ? '#93c5fd' : '#dbeafe';
              return <td key={cell.key}><button type="button" aria-pressed={selectedCell === cell.key} aria-label={`${cell.day} ${cell.time} ER ${cell.rate}%`} onClick={() => setSelectedCell(cell.key)} className={`w-full rounded-md px-1 py-2.5 font-medium hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800 ${selectedCell === cell.key ? 'ring-2 ring-slate-800 ring-offset-1' : ''}`} style={{ backgroundColor, color: dark ? '#ffffff' : '#1e3a8a' }}>{cell.rate}%</button></td>;
            })}</tr>)}</tbody>
          </table></div>
          <p className="mt-3 text-xs text-slate-500">สีเข้มหมายถึง ER สูงกว่า · ER = จำนวนการมีส่วนร่วม ÷ ยอดดู × 100</p>
          <p role="status" className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm leading-relaxed text-blue-800">{activeCell ? `${activeCell.day} ${activeCell.time}: ER ${activeCell.rate}% · ${number(activeCell.views)} ยอดดู · ${activeCell.clips} คลิปตัวอย่าง` : 'เลือกช่องในตารางเพื่อดูยอดรับชมและจำนวนคลิปของช่วงนั้น'}</p>
        </Panel>

        <Panel title="POPULAR AUDIO TRACKS" subtitle={`เสียงสมมติในคลิปของ${destination.name} เรียงตามยอดรับชมรวม`}>
          <div className="space-y-3">{audioData.map((audio, index) => <div key={audio.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-4"><span className="text-sm text-slate-400">{index + 1}</span><span className="rounded-xl bg-blue-100 p-3 text-blue-600"><Music2 size={20} aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="font-semibold text-slate-800">{audio.name}</p><p className="mt-1 text-xs text-slate-500">{audio.description}</p><p className="mt-1 text-xs text-slate-500">{audio.clips} คลิป · ER {audio.rate}%</p></div><div className="text-right"><p className="font-bold text-blue-700">{compact(audio.views)}</p><p className="text-xs text-slate-500">ยอดรับชม</p></div></div>)}</div>
          <p className="mt-4 text-xs text-slate-500">ชื่อเสียงเป็นข้อมูลสมมติ ยังไม่มีไฟล์เสียงจริงให้เล่น</p>
        </Panel>

        <Panel title="COMPETITIVE ANALYSIS" subtitle="เปรียบเทียบยอดรับชมของทั้ง 4 สถานที่ในช่วงเวลาเดียวกัน">
          <div className="h-72 min-w-0"><ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={comparison} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={compact} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value, _name, item) => [`${number(value)} ครั้ง · ER ${item.payload.rate}%`, 'ยอดรับชม']} />
              <Bar dataKey="views" radius={[0, 5, 5, 0]} maxBarSize={34} isAnimationActive={false}>{comparison.map((item) => <Cell key={item.id} fill={item.id === destinationId ? '#2563eb' : '#99d8cf'} />)}</Bar>
            </BarChart>
          </ResponsiveContainer></div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">แท่งสีน้ำเงินคือ{destination.name} · ผลเปรียบเทียบใช้ข้อมูลสมมติเท่านั้น</p>
        </Panel>
      </div>
    </div>
  );
}

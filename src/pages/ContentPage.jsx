import { useState } from 'react';
import { Info, Film, Heart, Sparkles, Clock3, Music2, Check, Plus, RotateCcw, Users } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

// 1. ข้อมูลสมมติ ใช้ฝึกสร้างหน้าจอ ไม่ใช่สถิติหรือคำแนะนำจาก TikTok จริง
const categories = ['ทะเล', 'คาเฟ่', 'ธรรมชาติ'];
const formats = ['รีวิว', 'Vlog', 'POV', 'ทริปประหยัด'];
const durations = [
  { id: 'short', label: '15–30 วินาที', shortLabel: '15–30 วิ', idea: 'แนะนำจุดเด่นหรือพิกัดเดียวให้กระชับ' },
  { id: 'medium', label: '31–60 วินาที', shortLabel: '31–60 วิ', idea: 'พาเที่ยวพร้อมเล่าเส้นทางและค่าใช้จ่าย' },
  { id: 'long', label: '61–90 วินาที', shortLabel: '61–90 วิ', idea: 'เล่ารีวิวหรือแผนเที่ยวแบบมีรายละเอียด' },
];
const audios = [
  { id: 'weekend', name: 'Weekend Escape', mood: 'จังหวะสดใส เหมาะกับภาพบรรยากาศทริป', color: 'bg-blue-100 text-blue-600' },
  { id: 'coffee', name: 'Coffee Break', mood: 'โทนผ่อนคลายสำหรับคาเฟ่และไลฟ์สไตล์', color: 'bg-amber-100 text-amber-700' },
  { id: 'mountain', name: 'Mountain Morning', mood: 'โทนสงบสำหรับวิวและธรรมชาติ', color: 'bg-teal-100 text-teal-700' },
];
const creators = [
  { id: 'sea-a', name: 'May Travel', handle: '@travel.demo.a', category: 'ทะเล', initials: 'MT', color: 'bg-blue-100 text-blue-700' },
  { id: 'sea-b', name: 'Beach Diary', handle: '@travel.demo.b', category: 'ทะเล', initials: 'BD', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'cafe-a', name: 'Cafe Story', handle: '@cafe.demo.a', category: 'คาเฟ่', initials: 'CS', color: 'bg-amber-100 text-amber-700' },
  { id: 'cafe-b', name: 'Slow Coffee', handle: '@cafe.demo.b', category: 'คาเฟ่', initials: 'SC', color: 'bg-orange-100 text-orange-700' },
  { id: 'nature-a', name: 'Mountain Trip', handle: '@nature.demo.a', category: 'ธรรมชาติ', initials: 'MP', color: 'bg-teal-100 text-teal-700' },
  { id: 'nature-b', name: 'Green Journey', handle: '@nature.demo.b', category: 'ธรรมชาติ', initials: 'GJ', color: 'bg-emerald-100 text-emerald-700' },
];

// จำลองคลิป 180 รายการ: 30 วัน × 3 หมวด × 2 คลิปต่อวันต่อหมวด
const demoVideos = Array.from({ length: 30 }, (_, day) => categories.flatMap((category, categoryIndex) => (
  [0, 1].map((variant) => {
    const formatIndex = (day + variant + categoryIndex) % formats.length;
    const durationIndex = (day + variant + categoryIndex * 2) % durations.length;
    const views = 12000 + day * 850 + variant * 3500 + categoryIndex * 2400 + (day % 5) * 1350;
    const durationScores = [[5.4, 7.0, 4.6], [7.3, 6.5, 4.3], [4.7, 7.3, 5.8]];
    const formatScores = [[0.5, 1.5, 0.9, 1.0], [1.6, 0.9, 1.3, 0.5], [0.8, 1.4, 0.7, 1.1]];
    const engagement = durationScores[categoryIndex][durationIndex] + formatScores[categoryIndex][formatIndex] + variant * 0.15 + (day % 7) * 0.07;
    const actions = views * engagement / 100;
    return {
      id: `${day}-${categoryIndex}-${variant}`, day, category, views,
      date: new Date(Date.UTC(2026, 7, 22 + day)).toISOString().slice(0, 10),
      format: formats[formatIndex], durationId: durations[durationIndex].id,
      audioId: audios[(day + variant * 2 + categoryIndex) % audios.length].id,
      creatorId: creators[categoryIndex * 2 + variant].id,
      likes: Math.round(actions * 0.7), comments: Math.round(actions * 0.05),
      shares: Math.round(actions * 0.1), saves: Math.round(actions * 0.15),
      completed: Math.round(views * ([0.85, 0.63, 0.43][durationIndex] + categoryIndex * 0.01 + (day % 5) * 0.005)),
    };
  })
))).flat();

const number = (value) => new Intl.NumberFormat('en-US').format(value);
const shortNumber = (value) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
const shortDate = (date) => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
const fieldClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500';

// ER คืออัตรามีส่วนร่วม: รวมไลก์ คอมเมนต์ แชร์ และบันทึก หารด้วยยอดดู
function summarize(videos) {
  const totals = videos.reduce((result, video) => ({
    views: result.views + video.views,
    actions: result.actions + video.likes + video.comments + video.shares + video.saves,
    completed: result.completed + video.completed,
  }), { views: 0, actions: 0, completed: 0 });
  return {
    clips: videos.length, views: totals.views,
    rate: totals.views ? Number((totals.actions / totals.views * 100).toFixed(1)) : 0,
    completionRate: totals.views ? Number((totals.completed / totals.views * 100).toFixed(1)) : 0,
  };
}

// 2. กล่องข้อมูลและกรอบแต่ละส่วนของหน้า
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

// 3. ตัวเลือกและผลวิเคราะห์จะอัปเดตทันทีเมื่อค่าใน useState เปลี่ยน
export default function ContentPage() {
  const [period, setPeriod] = useState(7);
  const [category, setCategory] = useState('all');
  const [selectedAudioId, setSelectedAudioId] = useState(null);
  const [selectedCreatorIds, setSelectedCreatorIds] = useState([]);

  const videos = demoVideos.filter((video) => video.day >= 30 - period && (category === 'all' || video.category === category));
  const overview = summarize(videos);
  const formatData = formats.map((format) => ({ name: format, ...summarize(videos.filter((video) => video.format === format)) }));
  const bestFormat = [...formatData].sort((a, b) => b.rate - a.rate)[0];
  const durationData = durations.map((duration) => ({ ...duration, ...summarize(videos.filter((video) => video.durationId === duration.id)) }));
  const bestDuration = [...durationData].sort((a, b) => b.rate - a.rate)[0];
  const audioData = audios.map((audio) => ({ ...audio, ...summarize(videos.filter((video) => video.audioId === audio.id)) })).sort((a, b) => b.rate - a.rate);
  const creatorData = creators.map((creator) => ({ ...creator, ...summarize(videos.filter((video) => video.creatorId === creator.id)) })).filter((creator) => creator.clips > 0).sort((a, b) => b.rate - a.rate || b.views - a.views);
  const selectedAudio = audios.find((audio) => audio.id === selectedAudioId);
  const selectedCreators = creators.filter((creator) => selectedCreatorIds.includes(creator.id));
  const dateRange = `${shortDate(videos[0].date)} – ${shortDate(videos[videos.length - 1].date)} 2569`;

  function toggleCreator(id) {
    setSelectedCreatorIds((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]);
  }

  function resetAll() {
    setPeriod(7);
    setCategory('all');
    setSelectedAudioId(null);
    setSelectedCreatorIds([]);
  }

  return (
    <div className="min-w-0 space-y-6 p-4 lg:p-8">
      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-800">
        <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>ข้อมูลตัวอย่างสำหรับฝึกทำหน้า Content Optimization · สถิติ ชื่อเสียง และครีเอเตอร์เป็นข้อมูลสมมติ ยังไม่มีไฟล์เสียงจริงและไม่ได้เชื่อมต่อ TikTok</p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div><h2 className="text-lg font-bold text-slate-800">วางแผนคอนเทนต์จากข้อมูลตัวอย่าง</h2><p className="mt-1 text-sm text-slate-500">ช่วงข้อมูล: {dateRange}</p></div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700"><span>ช่วงเวลา</span><select value={period} onChange={(event) => setPeriod(Number(event.target.value))} className={fieldClass}><option value={7}>7 วันสุดท้ายของชุดตัวอย่าง</option><option value={30}>30 วันทั้งหมด</option></select></label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700"><span>หมวดคอนเทนต์</span><select value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}><option value="all">ทั้งหมด</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <button type="button" onClick={resetAll} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"><RotateCcw size={16} aria-hidden="true" />รีเซ็ต</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite" aria-atomic="true">
        <MetricCard title="คลิปที่นำมาวิเคราะห์" value={`${number(overview.clips)} คลิป`} detail={`ยอดดูรวม ${number(overview.views)} ครั้ง`} icon={Film} />
        <MetricCard title="อัตรามีส่วนร่วมรวม (ER)" value={`${overview.rate}%`} detail="ไลก์ + คอมเมนต์ + แชร์ + บันทึก เทียบกับยอดดู" icon={Heart} />
        <MetricCard title="ประเภทที่มี ER สูงสุด" value={bestFormat.name} detail={`ER ${bestFormat.rate}% ในข้อมูลที่เลือก`} icon={Sparkles} />
        <MetricCard title="ความยาวที่น่าลอง" value={bestDuration.shortLabel} detail={`ER สูงสุด ${bestDuration.rate}% ในชุดตัวอย่าง`} icon={Clock3} />
      </div>

      <div className="grid items-stretch gap-6 xl:grid-cols-2">
        <Panel title="CONTENT TYPE EFFICIENCY" subtitle="เปรียบเทียบอัตรามีส่วนร่วมของคอนเทนต์แต่ละประเภท">
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={formatData} margin={{ top: 24, right: 12, left: 0, bottom: 0 }} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 12]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} cursor={{ fill: '#f1f5f9' }} formatter={(value, _name, item) => [`${value}% · ${item.payload.clips} คลิป`, 'ER']} />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive={false}>
                  {formatData.map((item) => <Cell key={item.name} fill={item.name === bestFormat.name ? '#2563eb' : '#14b8a6'} />)}
                  <LabelList dataKey="rate" position="top" formatter={(value) => `${value}%`} style={{ fontSize: 12, fill: '#475569' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-sm leading-relaxed text-blue-800">ในชุดข้อมูลที่เลือก <strong>{bestFormat.name}</strong> มี ER สูงสุด {bestFormat.rate}%</p>
        </Panel>

        <Panel title="RECOMMENDED AUDIO" subtitle="เสียงสมมติ เรียงตาม ER ของคลิปตัวอย่างที่ใช้เสียงนั้น">
          <div className="space-y-3">
            {audioData.map((audio, index) => {
              const selected = selectedAudioId === audio.id;
              return (
                <div key={audio.id} className={`rounded-xl border p-4 ${selected ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`rounded-xl p-3 ${audio.color}`}><Music2 size={20} aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1"><p className="font-semibold text-slate-800">{index + 1}. {audio.name}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{audio.mood}</p></div>
                    <span className="shrink-0 text-sm font-bold text-blue-700">{audio.rate}%</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">{audio.clips} คลิปตัวอย่าง · {shortNumber(audio.views)} ยอดดู</p>
                    <button type="button" aria-pressed={selected} onClick={() => setSelectedAudioId(selected ? null : audio.id)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${selected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{selected ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}{selected ? 'เลือกแล้ว' : 'เลือกเสียงนี้'}</button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">ใช้เลือกไอเดียชื่อเสียงเท่านั้น ยังไม่มีปุ่มเล่นหรือดาวน์โหลดเสียงจริง</p>
        </Panel>

        <Panel title="IDEAL VIDEO LENGTH" subtitle="เปรียบเทียบความยาวคลิปจาก ER และอัตราดูจบของข้อมูลตัวอย่าง">
          <div className="grid gap-3 sm:grid-cols-3">
            {durationData.map((duration) => {
              const recommended = duration.id === bestDuration.id;
              return (
                <article key={duration.id} className={`rounded-xl border p-4 ${recommended ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                  <span className={`inline-block rounded-full px-2 py-1 text-xs ${recommended ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}>{recommended ? 'ER สูงสุด' : 'ช่วงความยาว'}</span>
                  <Clock3 size={26} className="mb-3 mt-5 text-blue-600" aria-hidden="true" />
                  <h3 className="font-bold text-slate-800">{duration.label}</h3>
                  <p className="mt-3 text-2xl font-bold text-blue-700">{duration.rate}%</p><p className="text-xs text-slate-500">อัตรามีส่วนร่วม (ER)</p>
                  <p className="mt-3 text-sm text-slate-700">ดูจบ {duration.completionRate}%</p>
                  <p className="mt-1 text-xs text-slate-500">จาก {duration.clips} คลิป</p>
                  <p className="mt-4 border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-600">{duration.idea}</p>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">ช่วงที่แนะนำอิง ER สูงสุดในชุดตัวอย่าง ไม่ได้ยืนยันว่าความยาวนั้นทำให้คลิปจริงได้ผลดีที่สุด</p>
        </Panel>

        <Panel title="TOP PERFORMING CREATORS" subtitle="ครีเอเตอร์สมมติ เรียงตาม ER ในช่วงเวลาและหมวดที่เลือก">
          <ul className="space-y-3">
            {creatorData.map((creator, index) => {
              const selected = selectedCreatorIds.includes(creator.id);
              return (
                <li key={creator.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <span className="w-4 text-xs text-slate-400">{index + 1}</span>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${creator.color}`}>{creator.initials}</span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{creator.name}</p><p className="break-all text-xs text-slate-500">{creator.handle}</p><p className="mt-1 text-xs text-slate-500">{creator.category} · {creator.clips} คลิป · {shortNumber(creator.views)} ยอดดู</p></div>
                  <div className="text-right"><p className="mb-1.5 text-sm font-bold text-blue-700">ER {creator.rate}%</p><button type="button" aria-pressed={selected} aria-label={`${selected ? 'ยกเลิกเลือก' : 'เลือก'} ${creator.name}`} onClick={() => toggleCreator(creator.id)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${selected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>{selected ? 'เลือกแล้ว' : 'เลือก'}</button></div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5" aria-live="polite">
        <h2 className="flex items-center gap-2 font-bold text-slate-800"><Sparkles size={19} className="text-blue-600" aria-hidden="true" />ไอเดียสำหรับคลิปถัดไป</h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <div><p className="text-slate-500">ประเภทที่มี ER สูงสุด</p><p className="mt-1 font-semibold text-slate-800">{bestFormat.name}</p></div>
          <div><p className="text-slate-500">ความยาวที่น่าลอง</p><p className="mt-1 font-semibold text-slate-800">{bestDuration.label}</p></div>
          <div><p className="text-slate-500">เสียงที่เลือก</p><p className="mt-1 font-semibold text-slate-800">{selectedAudio ? selectedAudio.name : 'ยังไม่ได้เลือกเสียง'}</p></div>
          <div><p className="flex items-center gap-1 text-slate-500"><Users size={15} aria-hidden="true" />ครีเอเตอร์ที่สนใจ ({selectedCreators.length})</p><p className="mt-1 font-semibold text-slate-800">{selectedCreators.length ? selectedCreators.map((creator) => creator.name).join(', ') : 'ยังไม่ได้เลือกครีเอเตอร์'}</p></div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">รายการที่เลือกอยู่เฉพาะขณะเปิดหน้านี้ เมื่อรีเฟรชหรือเปลี่ยนหน้า รายการจะเริ่มใหม่ และไม่มีการส่งคำขอติดตามไปยัง TikTok</p>
      </section>

      <p className="text-xs leading-relaxed text-slate-500">วิธีคำนวณ ER = (ไลก์ + คอมเมนต์ + แชร์ + บันทึก) ÷ ยอดดู × 100 โดยรวมจำนวนก่อนหาร และการรับชมหนึ่งครั้งอาจมีหลายการกระทำ</p>
    </div>
  );
}

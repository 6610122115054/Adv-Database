import { useState } from 'react';
import { Search, SlidersHorizontal, Hash, Eye, Heart, Play, RotateCcw } from 'lucide-react';

// ข้อมูลตัวอย่างสำหรับฝึกทำหน้าเว็บ ยังไม่ได้เชื่อมต่อ TikTok หรือฐานข้อมูล
// รูปภาพเป็นภาพประกอบจาก Unsplash ไม่ใช่ภาพจากวิดีโอจริง
const images = {
  beach: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=500&q=80',
  cafe: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=500&q=80',
  mountain: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80',
};

const sampleVideos = [
  { id: 1, title: 'พาเที่ยวทะเลกระบี่ น้ำใสจนต้องไปซ้ำ', creator: '@travelwithmay', creatorType: 'Travel Creator', category: 'ทะเล', province: 'กระบี่', views: 1250000, likes: 98000, date: '2026-09-19', tags: ['เที่ยวไทย', 'ทะเล', 'กระบี่'], image: images.beach },
  { id: 2, title: 'คาเฟ่เชียงใหม่ บรรยากาศดี ถ่ายรูปสวย', creator: '@cafe.story', creatorType: 'Lifestyle Creator', category: 'คาเฟ่', province: 'เชียงใหม่', views: 856000, likes: 64200, date: '2026-09-20', tags: ['คาเฟ่', 'เชียงใหม่', 'ป้ายยา'], image: images.cafe },
  { id: 3, title: 'เที่ยวเขาใหญ่ 2 วัน 1 คืน กับเพื่อน', creator: '@go.with.gang', creatorType: 'Travel Creator', category: 'ธรรมชาติ', province: 'นครราชสีมา', views: 642000, likes: 45600, date: '2026-09-17', tags: ['เที่ยวไทย', 'เขาใหญ่', 'ธรรมชาติ'], image: images.mountain },
  { id: 4, title: 'ทะเลภูเก็ตกับงบเที่ยวแบบนักศึกษา', creator: '@budget.trip', creatorType: 'Travel Creator', category: 'ทะเล', province: 'ภูเก็ต', views: 532000, likes: 39200, date: '2026-09-18', tags: ['ภูเก็ต', 'ทะเล', 'งบน้อย'], image: images.beach },
  { id: 5, title: 'ร้านกาแฟเล็ก ๆ สำหรับวันพักผ่อน', creator: '@slow.day', creatorType: 'Lifestyle Creator', category: 'คาเฟ่', province: 'กรุงเทพฯ', views: 215000, likes: 18400, date: '2026-09-16', tags: ['คาเฟ่', 'กรุงเทพ', 'ป้ายยา'], image: images.cafe },
  { id: 6, title: 'เที่ยวเชียงใหม่ รับลมหนาวบนดอย', creator: '@mountain.diary', creatorType: 'Travel Creator', category: 'ธรรมชาติ', province: 'เชียงใหม่', views: 980000, likes: 81500, date: '2026-09-15', tags: ['เชียงใหม่', 'ธรรมชาติ', 'เที่ยวไทย'], image: images.mountain },
  { id: 7, title: 'กระบี่วันหยุด เดินเล่นริมทะเล', creator: '@one.fine.trip', creatorType: 'Lifestyle Creator', category: 'ทะเล', province: 'กระบี่', views: 78000, likes: 6200, date: '2026-09-14', tags: ['กระบี่', 'ทะเล', 'เที่ยวไทย'], image: images.beach },
  { id: 8, title: 'คาเฟ่ภูเก็ต มุมโปรดที่อยากบอกต่อ', creator: '@coffee.and.trip', creatorType: 'Lifestyle Creator', category: 'คาเฟ่', province: 'ภูเก็ต', views: 124000, likes: 9700, date: '2026-09-13', tags: ['ภูเก็ต', 'คาเฟ่', 'ป้ายยา'], image: images.cafe },
];

const trendingTags = ['เที่ยวไทย', 'ทะเล', 'คาเฟ่', 'เชียงใหม่', 'ธรรมชาติ', 'ป้ายยา'];
const defaultFilters = { category: 'all', province: 'all', creatorType: 'all', minViews: '0', sort: 'popular' };
const panelClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';
const formatNumber = (value) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

// ส่วนแสดงการ์ด 1 ใบ ใช้ซ้ำได้ทั้งรายการยอดนิยมและผลการค้นหา
function VideoCard({ video }) {
  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-200">
        <img
          src={video.image}
          alt={`ภาพประกอบหมวด${video.category}`}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(event) => { event.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-700">{video.category}</span>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-sm font-semibold text-white">
          <Play size={14} fill="currentColor" aria-hidden="true" /> {formatNumber(video.views)}
        </div>
      </div>
      <div className="space-y-2 p-3">
        <h3 className="text-sm font-semibold leading-relaxed text-slate-800">{video.title}</h3>
        <p className="break-all text-xs text-slate-500">{video.creator}</p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1" title="ยอดดู"><Eye size={13} aria-hidden="true" />{formatNumber(video.views)}</span>
          <span className="flex items-center gap-1" title="ถูกใจ"><Heart size={13} aria-hidden="true" />{formatNumber(video.likes)}</span>
        </div>
        <p className="text-xs leading-relaxed text-blue-600">{video.tags.map((tag) => `#${tag}`).join(' ')}</p>
        <p className="text-xs text-slate-400">{video.province} · {video.date}</p>
      </div>
    </article>
  );
}

export default function DiscoveryPage() {
  // useState ใช้เก็บค่าบนหน้าจอ เมื่อค่าเปลี่ยน React จะอัปเดตหน้าจอให้
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [filters, setFilters] = useState(defaultFilters);

  // ค้นหาจากชื่อคลิป ครีเอเตอร์ จังหวัด หมวดหมู่ และแฮชแท็ก
  const keyword = search.trim().toLowerCase().replace(/^#/, '');
  const results = sampleVideos.filter((video) => {
    const searchableText = [video.title, video.creator, video.province, video.category, ...video.tags].join(' ').toLowerCase();
    return searchableText.includes(keyword)
      && (filters.category === 'all' || video.category === filters.category)
      && (filters.province === 'all' || video.province === filters.province)
      && (filters.creatorType === 'all' || video.creatorType === filters.creatorType)
      && video.views >= Number(filters.minViews);
  }).sort((a, b) => filters.sort === 'latest' ? b.date.localeCompare(a.date) : b.views - a.views);

  const popularVideos = [...results].sort((a, b) => b.views - a.views).slice(0, 4);
  const updateFilter = (key, value) => setDraftFilters((previous) => ({ ...previous, [key]: value }));

  function resetAll() {
    setSearchInput('');
    setSearch('');
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
  }

  return (
    <div className="min-w-0 space-y-6 p-4 lg:p-8">
      <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-800">
        ข้อมูลตัวอย่างสำหรับพัฒนาหน้าเว็บ — ชื่อครีเอเตอร์และสถิติเป็นข้อมูลสมมติ ภาพเป็นภาพประกอบ ยังไม่เชื่อมต่อ TikTok และยังไม่เล่นวิดีโอจริง
      </p>

      {/* ช่องค้นหา: กด Enter หรือกดปุ่มค้นหาได้ */}
      <form
        role="search"
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => { event.preventDefault(); setSearch(searchInput); }}
      >
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-3.5 text-slate-400" aria-hidden="true" />
          <label htmlFor="discovery-search" className="sr-only">ค้นหาวิดีโอ แฮชแท็ก หรือสถานที่</label>
          <input
            id="discovery-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="ค้นหาวิดีโอ แฮชแท็ก หรือสถานที่ เช่น คาเฟ่"
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button type="submit" className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">ค้นหา</button>
      </form>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0 space-y-6">
          {/* ส่วนที่ 1: แฮชแท็ก กดเพื่อค้นหาได้ทันที */}
          <section className={panelClass}>
            <h2 className="flex items-center gap-2 font-bold text-slate-800"><Hash size={19} className="text-blue-600" aria-hidden="true" />TRENDING HASHTAGS</h2>
            <p className="mb-4 mt-1 text-sm text-slate-500">แฮชแท็กตัวอย่าง · กดเพื่อค้นหา</p>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={keyword === tag}
                  onClick={() => { setSearchInput(`#${tag}`); setSearch(`#${tag}`); }}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${keyword === tag ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                >#{tag}</button>
              ))}
            </div>
          </section>

          {/* ส่วนที่ 2: วิดีโอยอดนิยมจากผลที่ค้นหาและกรองแล้ว */}
          {popularVideos.length > 0 && (
            <section className={panelClass}>
              <h2 className="font-bold text-slate-800">POPULAR VIDEOS</h2>
              <p className="mb-4 mt-1 text-sm text-slate-500">วิดีโอยอดนิยมในผลการค้นหา · ข้อมูลตัวอย่าง</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {popularVideos.map((video) => <VideoCard key={video.id} video={video} />)}
              </div>
            </section>
          )}

          {/* ส่วนที่ 3: แสดงผลลัพธ์ทั้งหมด หรือข้อความเมื่อค้นหาไม่พบ */}
          <section className={panelClass}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-slate-800">VIDEOS / ผลการค้นหา</h2>
              <p role="status" className="text-sm text-slate-500">พบ {results.length} รายการ{search.trim() ? ` สำหรับ “${search.trim()}”` : ''}</p>
            </div>
            {results.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((video) => <VideoCard key={video.id} video={video} />)}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Search size={32} className="mx-auto mb-3 text-slate-300" aria-hidden="true" />
                <p className="font-medium text-slate-700">ไม่พบข้อมูลที่ตรงกับการค้นหา</p>
                <p className="mb-4 mt-1 text-sm text-slate-500">ลองเปลี่ยนคำค้นหาหรือเลือกตัวกรองใหม่</p>
                <button type="button" onClick={resetAll} className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700 hover:bg-blue-100">ล้างการค้นหาและตัวกรอง</button>
              </div>
            )}
          </section>
        </div>

        {/* ส่วนที่ 4: ตัวกรอง กดใช้ตัวกรองเพื่ออัปเดตผลลัพธ์ */}
        <aside className={`${panelClass} lg:sticky lg:top-24`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-slate-800"><SlidersHorizontal size={18} aria-hidden="true" />FILTERS</h2>
          <p className="mb-5 text-sm text-slate-500">เลือกเงื่อนไขแล้วกดใช้ตัวกรอง</p>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setFilters({ ...draftFilters }); }}>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              <span>หมวดหมู่คอนเทนต์</span>
              <select value={draftFilters.category} onChange={(event) => updateFilter('category', event.target.value)} className={fieldClass}>
                <option value="all">ทั้งหมด</option>
                {['ทะเล', 'คาเฟ่', 'ธรรมชาติ'].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              <span>จังหวัด</span>
              <select value={draftFilters.province} onChange={(event) => updateFilter('province', event.target.value)} className={fieldClass}>
                <option value="all">ทั้งหมด</option>
                {['กระบี่', 'เชียงใหม่', 'นครราชสีมา', 'ภูเก็ต', 'กรุงเทพฯ'].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              <span>ประเภทครีเอเตอร์</span>
              <select value={draftFilters.creatorType} onChange={(event) => updateFilter('creatorType', event.target.value)} className={fieldClass}>
                <option value="all">ทั้งหมด</option>
                <option value="Travel Creator">Travel Creator</option>
                <option value="Lifestyle Creator">Lifestyle Creator</option>
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              <span>ยอดดูขั้นต่ำ</span>
              <select value={draftFilters.minViews} onChange={(event) => updateFilter('minViews', event.target.value)} className={fieldClass}>
                <option value="0">ไม่จำกัด</option>
                <option value="100000">100,000 ครั้ง</option>
                <option value="500000">500,000 ครั้ง</option>
                <option value="1000000">1,000,000 ครั้ง</option>
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              <span>เรียงลำดับผลการค้นหา</span>
              <select value={draftFilters.sort} onChange={(event) => updateFilter('sort', event.target.value)} className={fieldClass}>
                <option value="popular">ยอดดูมากที่สุด</option>
                <option value="latest">วันที่ล่าสุด</option>
              </select>
            </label>
            <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">ใช้ตัวกรอง</button>
            <button type="button" onClick={resetAll} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"><RotateCcw size={15} aria-hidden="true" />ล้างทั้งหมด</button>
          </form>
        </aside>
      </div>
    </div>
  );
}

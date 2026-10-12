import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import "./TopUniversities.css";

// Same university collection and record types used by ClientsPage.jsx.
const LIST_ENDPOINT = "/public/clients";
const PAGE_SIZE = 12;
const asset = path => {
  if (typeof path !== "string" || !path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${(api.defaults?.baseURL || "").replace(/\/api\/?$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
};
const str = v => typeof v === "string" || typeof v === "number" ? String(v) : "";
const array = v => (Array.isArray(v) ? v : str(v).split(/[,|]/)).map(str).map(v => v.trim()).filter(Boolean);
const normalize = row => {
  let extra = {};
  try { extra = typeof row.extra_data === "string" ? JSON.parse(row.extra_data) || {} : row.extra_data || {}; } catch {}
  return {
    ...row, name: str(row.name),
    location: str(extra.location || extra.city || row.city), state: str(extra.state || row.state),
    modes: array(row.mode || extra.mode).map(v => /online/i.test(v) ? "Online" : /distance/i.test(v) ? "Distance" : /regular|campus/i.test(v) ? "Regular" : v),
    grade: str(extra.naac_grade || row.naac_grade),
    programTypes: array(extra.program_types || extra.program_type),
    courses: Array.isArray(extra.programs) ? extra.programs.map(p => str(p.name || p.title || p.program_name)) : [],
    cover: asset(extra.banner_url || extra.cover_image || extra.cover_image_url || row.banner_url || row.cover_image || row.cover_image_url),
  };
};
function Photo({ src, name }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? <img src={src} alt={`${name} campus`} loading="lazy" onError={() => setFailed(true)} /> : <div className="tu-placeholder">Campus photo unavailable</div>;
}
export default function TopUniversities() {
  const [rows, setRows] = useState([]), [photos, setPhotos] = useState({});
  const [loading, setLoading] = useState(true), [error, setError] = useState(""), [retry, setRetry] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(""), [stateSearch, setStateSearch] = useState(""), [sort, setSort] = useState("az");
  const emptyFilters = () => ({ modes: [], state: [], grade: [], programTypes: [] });
  const [filters, setFilters] = useState(emptyFilters), [saved, setSaved] = useState([]), [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(""); setRows([]); setPhotos({});
      try {
        const response = await api.get(LIST_ENDPOINT);
        const body = response.data;
        const list = Array.isArray(body) ? body : [body?.data, body?.clients, body?.results].find(Array.isArray);
        if (!list) throw new Error("Unexpected university list response. Check the collection endpoint.");
        const universities = list
          .filter(row => row.type === "client" || row.type === "university")
          .map(normalize);
        if (cancelled) return;
        setRows(universities); setLoading(false);
        // Limit campus-image requests to four in flight.
        let cursor = 0;
        async function worker() {
          while (!cancelled && cursor < universities.length) {
            const row = universities[cursor++];
            if (row.id == null) continue;
            try {
              const result = await api.get(`/university-images/public/${encodeURIComponent(row.id)}`);
              const images = (Array.isArray(result.data?.data) ? result.data.data : []).filter(image => Number(image.is_active) === 1).map(image => asset(image.image_url)).filter(Boolean);
              if (!cancelled) setPhotos(current => ({ ...current, [row.id]: images }));
            } catch { /* Keep the cover image fallback. */ }
          }
        }
        await Promise.all(Array.from({ length: Math.min(4, universities.length) }, worker));
      } catch (err) { if (!cancelled) { setError(err.message || "Unable to load universities."); setLoading(false); } }
    }
    load();
    return () => { cancelled = true; };
  }, [retry]);
  const heroPhotos = useMemo(() => {
    const campus = rows.flatMap(u => photos[u.id] || []);
    return [...new Set(campus.length ? campus : rows.map(u => u.cover).filter(Boolean))].slice(0, 12);
  }, [rows, photos]);
  useEffect(() => {
    if (heroPhotos.length < 2) return;
    const timer = setInterval(() => setHeroIndex(i => (i + 1) % heroPhotos.length), 6000);
    return () => clearInterval(timer);
  }, [heroPhotos.length]);
  const options = useMemo(() => Object.fromEntries(["modes", "state", "grade", "programTypes"].map(key => [key, [...new Set(rows.flatMap(u => Array.isArray(u[key]) ? u[key] : [u[key]]).filter(Boolean))].sort()])), [rows]);
  const visible = useMemo(() => rows.filter(u => [u.name, u.location, u.state, ...u.courses].join(" ").toLowerCase().includes(query.trim().toLowerCase()) && Object.entries(filters).every(([key, selected]) => !selected.length || selected.some(v => Array.isArray(u[key]) ? u[key].includes(v) : u[key] === v))).sort((a, b) => sort === "az" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)), [rows, filters, query, sort]);
  useEffect(() => { setPage(1); }, [query, filters, sort]);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRows = visible.slice(startIndex, startIndex + PAGE_SIZE);
  function changePage(nextPage) {
    setPage(Math.max(1, Math.min(nextPage, totalPages)));
    document.getElementById("tu-results")?.scrollIntoView({ behavior: "smooth" });
  }
  const toggle = (key, value) => setFilters(f => ({ ...f, [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value] }));
  const reset = () => { setFilters(emptyFilters()); setQuery(""); setStateSearch(""); };
  const hero = heroPhotos[heroIndex % Math.max(heroPhotos.length, 1)];
  function group(key, title, choices, open) {
    return <details className="tu-filter" open={open || undefined} key={key}><summary>{title}</summary>
      {key === "state" && <input className="tu-state-search" placeholder="Search state…" aria-label="Search states" value={stateSearch} onChange={e => setStateSearch(e.target.value)} />}
      {choices.length ? choices.filter(c => key !== "state" || c.label.toLowerCase().includes(stateSearch.toLowerCase())).map(c => <label className="tu-check" key={c.value}><input type="checkbox" checked={filters[key].includes(c.value)} onChange={() => toggle(key, c.value)} /><span>{c.label}</span><small>{rows.filter(u => Array.isArray(u[key]) ? u[key].includes(c.value) : u[key] === c.value).length}</small></label>) : <p className="tu-muted">No data available</p>}
    </details>;
  }
  return <main className="tu-page">
    <section className="tu-hero">
      {hero && <img className="tu-hero-image" key={hero} src={hero} alt="" onError={e => { e.currentTarget.style.visibility = "hidden"; }} />}
      <div className="tu-hero-content"><p className="tu-eyebrow">DISCOVER · COMPARE · CHOOSE</p><h1>Top Universities in India</h1><p className="tu-intro">Explore universities across Regular, Online and Distance modes.<br />Find the right university for your career and your next chapter.</p>
        <form className="tu-search" onSubmit={e => { e.preventDefault(); document.getElementById("tu-results")?.scrollIntoView({ behavior: "smooth" }); }}>
          <span aria-hidden="true">⌕</span><input placeholder="Search universities, location, courses…" aria-label="Search universities, locations and courses" value={query} onChange={e => setQuery(e.target.value)} />
          <select aria-label="Mode of learning" value={filters.modes.length === 1 ? filters.modes[0] : ""} onChange={e => setFilters(f => ({ ...f, modes: e.target.value ? [e.target.value] : [] }))}><option value="">All Modes</option>{options.modes.map(mode => <option key={mode}>{mode}</option>)}</select><button type="submit" aria-label="Search">⌕</button>
        </form>
        <div className="tu-stats">{[["♜", loading ? "—" : rows.length, "Universities Listed"], ["▦", loading ? "—" : options.modes.length, "Learning Modes"], ["⌖", loading ? "—" : options.state.length, "States Represented"], ["✓", "University Information", "Courses, campus & more"]].map(([icon, value, label]) => <div key={label}><i aria-hidden="true">{icon}</i><p><strong>{value}</strong><span>{label}</span></p></div>)}</div>
      </div>
    </section>
    <section className="tu-directory" id="tu-results"><aside className="tu-filters" aria-label="Filter universities"><div className="tu-filter-heading"><strong>☷ Filter Universities</strong><button type="button" onClick={reset}>Reset All</button></div>
      {Object.entries({ modes: "Mode of Learning", state: "State", grade: "NAAC Grade", programTypes: "Program Type" }).map(([key, title]) => group(key, title, options[key].map(value => ({ value, label: value === "Regular" ? "Regular (On-Campus)" : value })), key === "modes" || key === "state"))}
    </aside><div className="tu-results"><div className="tu-results-heading"><div><h2>Top {filters.modes.length === 1 ? filters.modes[0] + " " : ""}Universities in India</h2><p aria-live="polite">{loading ? "Loading universities…" : `Showing ${visible.length ? startIndex + 1 : 0}–${Math.min(startIndex + PAGE_SIZE, visible.length)} of ${visible.length} universities`}</p></div><label>Sort By: <select value={sort} onChange={e => setSort(e.target.value)}><option value="az">Name: A–Z</option><option value="za">Name: Z–A</option></select></label></div>
      {loading ? <div className="tu-message" role="status">Loading universities…</div> : error ? <div className="tu-message" role="alert"><p>{error}</p><button type="button" onClick={() => setRetry(n => n + 1)}>Try again</button></div> : !visible.length ? <div className="tu-message"><h3>No universities found</h3><p>Try another search or clear your filters.</p><button type="button" onClick={reset}>Clear filters</button></div> : <div className="tu-grid">{pageRows.map(u => {
        const key = String(u.id ?? u.slug);
        return <article className="tu-card" key={key}><div className="tu-card-photo"><Photo src={photos[u.id]?.[0] || u.cover} name={u.name} /><button className="tu-save" type="button" aria-label={`${saved.includes(key) ? "Unsave" : "Save"} ${u.name}`} aria-pressed={saved.includes(key)} onClick={() => setSaved(s => s.includes(key) ? s.filter(v => v !== key) : [...s, key])}>{saved.includes(key) ? "♥" : "♡"}</button></div><div className="tu-card-body"><h3>{u.name}</h3><p className="tu-location">⌖ {[u.location, u.state].filter(Boolean).join(", ") || "Location not provided"}</p>{u.grade && <span className="tu-badge">NAAC {u.grade}</span>}<div className="tu-tags">{(u.programTypes.length ? u.programTypes : u.modes).map(tag => <span key={tag}>{tag}</span>)}</div>{u.slug ? <Link className="tu-details" to={`/university/${encodeURIComponent(u.slug)}`}>View Details →</Link> : <span className="tu-details tu-muted">Details unavailable</span>}</div></article>;
      })}</div>}
      {!loading && !error && totalPages > 1 && <nav className="tu-pagination" aria-label="University pagination">
        <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>← Previous</button>
        <span aria-live="polite">Page {currentPage} of {totalPages}</span>
        <button type="button" disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>Next →</button>
      </nav>}
    </div></section>
  </main>;
}



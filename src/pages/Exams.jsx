import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Exams.css";

// Frontend demonstration data. These are fictional exams, not official schedules.
const SAMPLE_EXAMS = [
  { id: "engineering", name: "Engineering Entrance — Sample", short: "Sample Engineering Admission Test", category: "Engineering", icon: "⚙", mode: "Online", body: "Sample Technical Board", status: "Open", level: "National", course: "Undergraduate", application: "Sample window A", date: "To be announced", eligibility: "Sample: completion of higher secondary education.", syllabus: "Sample topics: mathematics, physics and chemistry." },
  { id: "medical", name: "Medical Entrance — Sample", short: "Sample Medical Admission Test", category: "Medical", icon: "♧", mode: "Regular (On-Campus)", body: "Sample Medical Board", status: "Upcoming", level: "National", course: "Undergraduate", application: "Sample window B", date: "To be announced", eligibility: "Sample: higher secondary education with science subjects.", syllabus: "Sample topics: biology, physics and chemistry." },
  { id: "general", name: "University Entrance — Sample", short: "Sample University Admission Test", category: "General", icon: "♜", mode: "Online", body: "Sample University Council", status: "Closed", level: "State", course: "Undergraduate", application: "Sample window closed", date: "To be announced", eligibility: "Sample: eligibility depends on the selected course.", syllabus: "Sample topics: language, reasoning and subject knowledge." },
  { id: "management", name: "Management Entrance — Sample", short: "Sample Management Admission Test", category: "Management", icon: "▥", mode: "Online", body: "Sample Management Council", status: "Upcoming", level: "National", course: "Postgraduate", application: "Sample window C", date: "To be announced", eligibility: "Sample: completion of an undergraduate degree.", syllabus: "Sample topics: quantitative aptitude, verbal ability and reasoning." },
  { id: "law", name: "Law Entrance — Sample", short: "Sample Law Admission Test", category: "Law", icon: "⚖", mode: "Regular (On-Campus)", body: "Sample Law Council", status: "Open", level: "State", course: "Undergraduate", application: "Sample window D", date: "To be announced", eligibility: "Sample: completion of higher secondary education.", syllabus: "Sample topics: reading, legal reasoning and general awareness." },
  { id: "design", name: "Design Entrance — Sample", short: "Sample Design Admission Test", category: "Design", icon: "✎", mode: "Regular (On-Campus)", body: "Sample Design Council", status: "Upcoming", level: "Institute", course: "Undergraduate", application: "Sample window E", date: "To be announced", eligibility: "Sample: completion of higher secondary education.", syllabus: "Sample topics: creative thinking, visual ability and drawing." },
  { id: "government", name: "Government Recruitment — Sample", short: "Sample Recruitment Examination", category: "Government", icon: "▦", mode: "Online", body: "Sample Recruitment Board", status: "Open", level: "National", course: "Recruitment", application: "Sample window F", date: "To be announced", eligibility: "Sample: requirements vary by the selected position.", syllabus: "Sample topics: general knowledge, arithmetic and reasoning." },
];
const CATEGORIES = ["All Exams", "Engineering", "Medical", "Management", "Law", "Design", "Government", "General"];
const FILTERS = { mode: "Mode", category: "Exam Category", body: "Conducting Body", status: "Application Status", level: "Exam Level", course: "Course Type" };
const emptyFilters = () => Object.fromEntries(Object.keys(FILTERS).map(key => [key, []]));

export default function Exams() {
  const [query, setQuery] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [category, setCategory] = useState("All Exams");
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState("default");
  const [expanded, setExpanded] = useState(null);
  const exams = useMemo(() => SAMPLE_EXAMS.filter(exam =>
    (category === "All Exams" || exam.category === category) &&
    [exam.name, exam.short, exam.category, exam.course, exam.body].join(" ").toLowerCase().includes(query.trim().toLowerCase()) &&
    Object.entries(filters).every(([key, values]) => !values.length || values.includes(exam[key])))
    .sort((a, b) => sort === "az" ? a.name.localeCompare(b.name) : sort === "za" ? b.name.localeCompare(a.name) : SAMPLE_EXAMS.indexOf(a) - SAMPLE_EXAMS.indexOf(b)), [query, category, filters, sort]);
  function reset() { setQuery(""); setFilterSearch(""); setCategory("All Exams"); setFilters(emptyFilters()); setExpanded(null); }
  function toggle(key, value) { setFilters(current => ({ ...current, [key]: current[key].includes(value) ? current[key].filter(item => item !== value) : [...current[key], value] })); }
  return <main className="ex-page">
    <section className="ex-hero">
      <div className="ex-hero-inner">
        <nav className="ex-breadcrumb" aria-label="Breadcrumb"><Link to="/">⌂ Home</Link><span>›</span><span>Exams</span></nav>
        <div className="ex-hero-copy"><h1>Your Exam<br /><span>Your Future</span></h1><p>Explore, compare and discover entrance exams across different streams. Find application information, eligibility and syllabus in one place.</p></div>
        <div className="ex-hero-art" aria-hidden="true"><div className="ex-circle ex-circle-one" /><div className="ex-circle ex-circle-two" /><div className="ex-book"><span>YOUR NEXT</span><strong>CHAPTER</strong><div>✦</div></div><div className="ex-hero-words">Prepare<br />Compare<br />Plan<br />Achieve<span /></div></div>
        <form className="ex-search" onSubmit={event => { event.preventDefault(); document.getElementById("exam-results")?.scrollIntoView({ behavior: "smooth" }); }}>
          <span aria-hidden="true">⌕</span><input aria-label="Search exams" placeholder="Search exam by name, course, conducting body…" value={query} onChange={event => setQuery(event.target.value)} />
          <select aria-label="Mode of examination" value={filters.mode.length === 1 ? filters.mode[0] : ""} onChange={event => setFilters(current => ({ ...current, mode: event.target.value ? [event.target.value] : [] }))}><option value="">All Modes</option>{[...new Set(SAMPLE_EXAMS.map(exam => exam.mode))].map(mode => <option key={mode}>{mode}</option>)}</select><button type="submit">Search <span aria-hidden="true">→</span></button>
        </form>
      </div>
    </section>
    <div className="ex-container">
      <div className="ex-categories" role="group" aria-label="Exam categories">{CATEGORIES.map(item => <button type="button" key={item} aria-pressed={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <p className="ex-sample-notice">Demo preview · All exams and details below are fictional sample content.</p>
      <div className="ex-layout">
        <aside className="ex-filters" aria-label="Filter exams"><div className="ex-filter-heading"><strong>Filters</strong><button type="button" onClick={reset}>Clear All</button></div><input className="ex-filter-search" aria-label="Search filter options" placeholder="Search filters…" value={filterSearch} onChange={event => setFilterSearch(event.target.value)} />
          {Object.entries(FILTERS).map(([key, label]) => <details className="ex-filter-group" key={key} open={key === "mode" || undefined}><summary>{label}</summary>{[...new Set(SAMPLE_EXAMS.map(exam => exam[key]))].filter(value => value.toLowerCase().includes(filterSearch.toLowerCase())).map(value => <label key={value}><input type="checkbox" checked={filters[key].includes(value)} onChange={() => toggle(key, value)} /><span>{value}</span></label>)}</details>)}
        </aside>
        <section className="ex-results" id="exam-results" aria-label="Exam results"><div className="ex-results-heading"><div><h2>{category} <span>({exams.length})</span></h2><p>Explore sample application details, eligibility, syllabus and more.</p></div><label>Sort By: <select value={sort} onChange={event => setSort(event.target.value)}><option value="default">Default Order</option><option value="az">Name: A–Z</option><option value="za">Name: Z–A</option></select></label></div><p className="ex-result-count" aria-live="polite">{exams.length} sample exams found</p>
          <div className="ex-list">{exams.map(exam => <article className={`ex-card ex-theme-${exam.category.toLowerCase()}`} key={exam.id}><div className="ex-card-row"><div className="ex-exam-title"><div className="ex-icon" aria-hidden="true">{exam.icon}</div><div><h3>{exam.name}</h3><p>{exam.short}</p><span className="ex-category-tag">{exam.category}</span></div></div><div className="ex-meta"><strong>{exam.body}</strong><span>Conducting Body</span></div><div className="ex-meta"><span>Application</span><strong>{exam.application}</strong><small>{exam.status}</small></div><div className="ex-meta"><span>Exam Date</span><strong>{exam.date}</strong></div><button className="ex-view" type="button" aria-expanded={expanded === exam.id} aria-controls={`exam-${exam.id}-details`} onClick={() => setExpanded(current => current === exam.id ? null : exam.id)}>{expanded === exam.id ? "Hide Details" : "View Details"} <span aria-hidden="true">→</span></button></div>
            {expanded === exam.id && <div className="ex-details" id={`exam-${exam.id}-details`}><p className="ex-detail-note">Sample information for this frontend preview.</p><dl><div><dt>Mode</dt><dd>{exam.mode}</dd></div><div><dt>Exam Level</dt><dd>{exam.level}</dd></div><div><dt>Course Type</dt><dd>{exam.course}</dd></div><div><dt>Eligibility</dt><dd>{exam.eligibility}</dd></div><div><dt>Syllabus</dt><dd>{exam.syllabus}</dd></div></dl></div>}
          </article>)}</div>
          {!exams.length && <div className="ex-empty"><h3>No exams found</h3><p>Try another search or clear the filters.</p><button type="button" onClick={reset}>Clear filters</button></div>}
        </section>
      </div>
    </div>
  </main>;
}


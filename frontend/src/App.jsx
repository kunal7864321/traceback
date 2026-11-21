
import { useEffect, useState } from "react";
import {
  Search, Plus, LayoutDashboard, FileSearch,
  Bell, MapPin, Package, ArrowUpRight,
  AlertCircle, CheckCircle2, Menu, X
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5050/api";

export default function App() {
  const [reports, setReports] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [form, setForm] = useState({
    report_type: "LOST",
    title: "",
    description: "",
    brand: "",
    colour: "",
    category_id: "1",
    organization_id: "1",
    location_id: "1"
  });

  const loadData = async () => {
    try {
      const [r, m] = await Promise.all([
        fetch(`${API}/reports`),
        fetch(`${API}/matches`)
      ]);
      if (!r.ok || !m.ok) throw new Error("API error");
      setReports(await r.json());
      setMatches(await m.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          reporter_user_id: 1,
          category_id: Number(form.category_id),
          organization_id: Number(form.organization_id),
          location_id: Number(form.location_id)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert("Report submitted successfully!");
      setShowForm(false);
      setForm({ ...form, title: "", description: "", brand: "", colour: "" });
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = reports.filter((r) =>
    `${r.title} ${r.brand || ""} ${r.category_name}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const nav = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "All Reports", icon: FileSearch },
    { name: "Smart Matches", icon: Package }
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">T</div>
          <div>
            <h2>TraceBack</h2>
            <span>LOST & FOUND NETWORK</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileMenu(false)}>
            <X />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        {nav.map(({ name, icon: Icon }) => (
          <button
            key={name}
            className={`nav-item ${activeTab === name ? "active" : ""}`}
            onClick={() => {
              setActiveTab(name);
              setMobileMenu(false);
              setShowForm(false);
            }}
          >
            <Icon size={18} />
            {name}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="profile-avatar">K</div>
          <div>
            <strong>Kunal Kumar Jha</strong>
            <span>Campus Member</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileMenu(true)}>
            <Menu />
          </button>
          <div className="breadcrumb">Workspace / <strong>{activeTab}</strong></div>
          <div className="top-actions">
            <span className="live-status"><i /> System Online</span>
            <Bell size={19} />
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <span className="eyebrow">CAMPUS + CITY NETWORK</span>
              <h1>
                {showForm ? "Report an Item" :
                  activeTab === "Dashboard" ? "Find what matters." :
                  activeTab === "Smart Matches" ? "Smart Matches" : "Browse Reports"}
              </h1>
              <p>Connecting lost belongings with the people who miss them.</p>
            </div>
            <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
              <Plus size={18} /> Report an Item
            </button>
          </section>

          {showForm ? (
            <section className="panel form-panel">
              <h2>Submit an Item Report</h2>
              <form onSubmit={submitReport}>
                <label>Report Type</label>
                <select value={form.report_type}
                  onChange={e => setForm({...form, report_type:e.target.value})}>
                  <option value="LOST">I Lost Something</option>
                  <option value="FOUND">I Found Something</option>
                </select>

                <label>Item Name *</label>
                <input required placeholder="e.g. Black Dell Laptop"
                  value={form.title}
                  onChange={e => setForm({...form,title:e.target.value})}/>

                <label>Description</label>
                <textarea placeholder="Describe the item..."
                  value={form.description}
                  onChange={e => setForm({...form,description:e.target.value})}/>

                <div className="form-grid">
                  <div>
                    <label>Brand</label>
                    <input placeholder="Dell"
                      value={form.brand}
                      onChange={e => setForm({...form,brand:e.target.value})}/>
                  </div>
                  <div>
                    <label>Colour</label>
                    <input placeholder="Black"
                      value={form.colour}
                      onChange={e => setForm({...form,colour:e.target.value})}/>
                  </div>
                </div>

                <div className="form-grid">
                  <div>
                    <label>Category ID</label>
                    <select value={form.category_id}
                      onChange={e => setForm({...form,category_id:e.target.value})}>
                      <option value="1">Electronics</option>
                      <option value="2">Accessories</option>
                      <option value="3">Documents</option>
                      <option value="4">Bags</option>
                      <option value="5">Clothing</option>
                      <option value="6">Jewellery</option>
                      <option value="7">Other</option>
                    </select>
                  </div>
                  <div>
                    <label>Location ID</label>
                    <select value={form.location_id}
                      onChange={e => setForm({...form,location_id:e.target.value})}>
                      <option value="1">Library</option>
                      <option value="2">Cafeteria</option>
                      <option value="3">Main Gate</option>
                      <option value="4">Food Court</option>
                      <option value="5">Waiting Hall</option>
                    </select>
                  </div>
                </div>
                <label>Organization ID</label>
                <select value={form.organization_id}
                  onChange={e => setForm({...form,organization_id:e.target.value})}>
                  <option value="1">Newton School of Technology</option>
                  <option value="2">Phoenix Marketcity</option>
                  <option value="3">Pune Railway Station</option>
                </select>

                <div className="form-actions">
                  <button type="button" className="secondary-btn"
                    onClick={() => setShowForm(false)}>Cancel</button>
                  <button className="primary-btn" type="submit">
                    Submit Report <ArrowUpRight size={17}/>
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <>
              {activeTab === "Dashboard" && (
                <section className="stats-grid">
                  <div className="stat-card">
                    <span>Total Reports</span>
                    <strong>{reports.length}</strong>
                    <small><Package size={14}/> All submissions</small>
                  </div>
                  <div className="stat-card">
                    <span>Items Lost</span>
                    <strong>{reports.filter(r=>r.report_type==="LOST").length}</strong>
                    <small><AlertCircle size={14}/> Awaiting recovery</small>
                  </div>
                  <div className="stat-card">
                    <span>Items Found</span>
                    <strong>{reports.filter(r=>r.report_type==="FOUND").length}</strong>
                    <small><CheckCircle2 size={14}/> Reported found</small>
                  </div>
                  <div className="stat-card">
                    <span>Potential Matches</span>
                    <strong>{matches.length}</strong>
                    <small><Package size={14}/> Matching suggestions</small>
                  </div>
                </section>
              )}

              {activeTab !== "Smart Matches" && (
                <section className="panel">
                  <div className="section-heading">
                    <div>
                      <h2>{activeTab === "Dashboard" ? "Recent Reports" : "All Reports"}</h2>
                      <p>Latest items submitted to the network</p>
                    </div>
                    <div className="search-box">
                      <Search size={17}/>
                      <input placeholder="Search items..." value={search}
                        onChange={e=>setSearch(e.target.value)}/>
                    </div>
                  </div>

                  {loading ? <p>Loading reports...</p> : (
                    <div className="report-list">
                      {filtered.map(r=>(
                        <div className="report-row" key={r.report_id}>
                          <div className="item-icon"><Package/></div>
                          <div className="report-info">
                            <strong>{r.title}</strong>
                            <span>{r.brand || "Unspecified brand"} · {r.colour || "Unspecified colour"}</span>
                            <small><MapPin size={13}/> {r.organization_name} · {r.location_name}</small>
                          </div>
                          <span className={`type-tag ${r.report_type.toLowerCase()}`}>
                            {r.report_type}
                          </span>
                        </div>
                      ))}
                      {filtered.length===0 && <p>No matching reports found.</p>}
                    </div>
                  )}
                </section>
              )}

              {(activeTab === "Smart Matches" || activeTab === "Dashboard") && (
                <section className="panel matches-panel">
                  <div className="section-heading">
                    <div>
                      <h2>Smart Match Suggestions</h2>
                      <p>Potential lost and found item connections</p>
                    </div>
                    <span className="match-count">{matches.length} MATCHES</span>
                  </div>
                  {matches.map(m=>(
                    <div className="match-row" key={m.match_id}>
                      <div className="match-items">
                        <strong>{m.lost_item}</strong>
                        <span>↔</span>
                        <strong>{m.found_item}</strong>
                      </div>
                      <div className="score-wrap">
                        <strong>{Number(m.match_score).toFixed(0)}%</strong>
                        <div className="score-track">
                          <div style={{width:`${m.match_score}%`}}/>
                        </div>
                        <small>{m.match_status}</small>
                      </div>
                    </div>
                  ))}
                  {matches.length===0 && <p>No matches yet.</p>}
                </section>
              )}
            </>
          )}
          <footer>© 2026 TraceBack · Intelligent Lost & Found Network</footer>
        </div>
      </main>
    </div>
  );
}

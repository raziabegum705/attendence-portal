import { useMemo, useState } from "react";

const PAGE_SIZE = 8;

export default function DefaulterTable({ defaulters }) {
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("all");
  const [sort, setSort] = useState("lowest");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);

  const getBarClass = (pct) => {
    const p = parseFloat(pct);
    if (p < 60) return "danger";
    if (p < 75) return "warning";
    return "safe";
  };

  const rows = useMemo(() => {
    const source = defaulters || [];
    return source
      .filter((student) => {
        const q = search.toLowerCase();
        const pct = parseFloat(student.percentage);
        const matchesSearch = [student.name, student.rollNo, student.email, student.phone].some((value) =>
          String(value || "").toLowerCase().includes(q)
        );
        const matchesRisk = risk === "all" || (risk === "critical" ? pct < 60 : pct >= 60 && pct < 75);
        return matchesSearch && matchesRisk;
      })
      .sort((a, b) => {
        if (sort === "name") return String(a.name).localeCompare(String(b.name));
        if (sort === "highest") return parseFloat(b.percentage) - parseFloat(a.percentage);
        return parseFloat(a.percentage) - parseFloat(b.percentage);
      });
  }, [defaulters, risk, search, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!defaulters || defaulters.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">OK</div>
        <h3>No Defaulters Found</h3>
        <p>All students have attendance above 75%.</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-tools">
        <input
          className="form-control"
          placeholder="Search by name, roll no, email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          aria-label="Search defaulters"
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select className="form-control" value={risk} onChange={(e) => { setRisk(e.target.value); setPage(1); }} aria-label="Filter by risk">
            <option value="all">All risk levels</option>
            <option value="critical">Critical under 60%</option>
            <option value="watch">Watchlist 60-74%</option>
          </select>
          <select className="form-control" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort defaulters">
            <option value="lowest">Lowest attendance</option>
            <option value="highest">Highest attendance</option>
            <option value="name">Student name</option>
          </select>
        </div>
      </div>

      <div className="table-wrap desktop-table">
        <table className="fk-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Contact</th>
              <th>Attendance</th>
              <th>Status</th>
              <th>Alerts</th>
              <th>Classes</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((student, index) => {
              const pct = parseFloat(student.percentage);
              const status = pct < 60 ? "Late Submission Risk" : "No Letter Submitted";
              return (
                <tr key={`${student.rollNo}-${index}`} onClick={() => setExpanded(expanded === index ? null : index)} style={{ cursor: "pointer" }}>
                  <td>
                    <div className="student-cell">
                      <span className="avatar">{student.name?.charAt(0)?.toUpperCase() || "S"}</span>
                      <span>
                        <strong style={{ color: "var(--text)" }}>{student.name}</strong>
                        <span style={{ display: "block", color: "var(--muted)", fontSize: 12 }}>{student.rollNo}</span>
                      </span>
                    </div>
                    {expanded === index && (
                      <div className="reason-box" style={{ marginTop: 12 }}>
                        Last notification date: pending send. Excuse letter status updates after the student submits through the secure link.
                      </div>
                    )}
                  </td>
                  <td>
                    <div>{student.email}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{student.phone || "No phone"}</div>
                  </td>
                  <td style={{ minWidth: 190 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="badge badge-danger">{student.percentage}%</span>
                      <div className="attendance-bar">
                        <div className={`attendance-bar-fill ${getBarClass(student.percentage)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${pct < 60 ? "badge-late" : "badge-no-letter"}`}>{status}</span></td>
                  <td>
                    <span className="badge badge-info">Email ready</span>{" "}
                    <span className="badge badge-info">WhatsApp ready</span>
                  </td>
                  <td>{student.attended}/{student.total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="record-mobile-list">
        {visible.map((student, index) => {
          const pct = parseFloat(student.percentage);
          return (
            <article className="mobile-record-card" key={`${student.rollNo}-mobile-${index}`}>
              <div className="student-cell">
                <span className="avatar">{student.name?.charAt(0)?.toUpperCase() || "S"}</span>
                <div>
                  <strong>{student.name}</strong>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>{student.rollNo}</div>
                </div>
              </div>
              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span className="badge badge-danger">{student.percentage}%</span>
                <span className={`badge ${pct < 60 ? "badge-late" : "badge-no-letter"}`}>{pct < 60 ? "Late Submission Risk" : "No Letter Submitted"}</span>
              </div>
              <div className="attendance-bar" style={{ marginTop: 12 }}>
                <div className={`attendance-bar-fill ${getBarClass(student.percentage)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div style={{ color: "var(--muted)", marginTop: 12, fontSize: 13 }}>{student.email}</div>
            </article>
          );
        })}
      </div>

      <div className="table-tools" style={{ marginTop: 14 }}>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          Showing {visible.length} of {rows.length} students
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <button className="btn btn-outline btn-sm" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button>
        </div>
      </div>
    </>
  );
}

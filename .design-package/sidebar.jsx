// Sidebar component
const Sidebar = ({ activeMeetingId, onSelectMeeting, meetings }) => {
  const grouped = React.useMemo(() => {
    const groups = { Today: [], "This week": [], "Last week": [] };
    meetings.forEach(m => { (groups[m.group] ||= []).push(m); });
    return groups;
  }, [meetings]);

  return (
    <aside className="sidebar">
      <div className="sb-header">
        <div className="logo-mark">MN</div>
        <div className="sb-title">Meeting Notes</div>
      </div>

      <button className="new-meeting">
        <IconPlus size={15} />
        New meeting
        <span className="kbd">⌘N</span>
      </button>

      <div className="sb-section">
        <div className="sb-nav">
          <button className="sb-item">
            <IconHome size={15} className="icon" /> Home
          </button>
          <button className="sb-item">
            <IconSearch size={15} className="icon" /> Search
            <span className="meta kbd">⌘K</span>
          </button>
          <button className="sb-item">
            <IconInbox size={15} className="icon" /> Inbox
            <span className="meta badge">3</span>
          </button>
        </div>
      </div>

      <div className="sb-group-label" style={{ paddingLeft: 18 }}>Meetings</div>

      <div className="sb-meetings hide-scroll">
        {Object.entries(grouped).map(([label, items]) => items.length > 0 && (
          <div className="sb-date-group" key={label}>
            <div className="sb-date-label">{label}</div>
            {items.map(m => (
              <button
                key={m.id}
                className={`meeting-item ${m.id === activeMeetingId ? "active" : ""}`}
                onClick={() => onSelectMeeting(m.id)}
              >
                <div className="mi-title">
                  {m.recording && <span className="mi-dot" />}
                  {m.title}
                </div>
                <div className="mi-time">{m.time}</div>
                <div className="mi-dur">{m.duration}</div>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="sb-footer">
        <div className="sb-section" style={{ padding: 0 }}>
          <button className="sb-item"><IconTemplate size={15} className="icon" /> Templates</button>
          <button className="sb-item"><IconSettings size={15} className="icon" /> Settings</button>
        </div>
        <button className="sb-profile">
          <div className="avatar lg sp-1">SM</div>
          <div className="profile-info">
            <div className="profile-name">Sophie Moore</div>
            <div className="profile-email">sophie@acme.com</div>
          </div>
          <IconChev size={14} style={{ color: "var(--ink-3)" }} />
        </button>
      </div>
    </aside>
  );
};

window.Sidebar = Sidebar;

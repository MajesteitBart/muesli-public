// Right rail: a single live WYSIWYG editor.
// Renders blocks (headings, paragraphs, bullets, tasks, agenda items) directly editable in place —
// no separate Edit/Preview modes, no separate Agenda card.

const uid = () => Math.random().toString(36).slice(2, 9);

// Default doc — agenda + meeting notes co-existing in one editable document.
const DEFAULT_DOC = [
  { id: uid(), kind: "h1", text: "Product Hunt Launch Meeting" },
  { id: uid(), kind: "h2", text: "Agenda" },
  { id: uid(), kind: "agenda", text: "Launch strategy overview", time: "10:00 AM", status: "active" },
  { id: uid(), kind: "agenda", text: "Product messaging & positioning", time: "10:15 AM", status: "not-started" },
  { id: uid(), kind: "agenda", text: "Demo & feature highlights", time: "10:35 AM", status: "not-started" },
  { id: uid(), kind: "agenda", text: "Go-to-market plan", time: "10:55 AM", status: "not-started" },
  { id: uid(), kind: "agenda", text: "Launch timeline & next steps", time: "11:15 AM", status: "not-started" },
  { id: uid(), kind: "h2", text: "Goals" },
  { id: uid(), kind: "task", text: "Finalize launch strategy", done: true },
  { id: uid(), kind: "task", text: "Review messaging", done: false },
  { id: uid(), kind: "task", text: "Align on timeline", done: false },
  { id: uid(), kind: "h2", text: "Key Takeaways" },
  { id: uid(), kind: "bullet", text: "Focus on time-saving and AI summarization" },
  { id: uid(), kind: "bullet", text: "Launch date: May 20th" },
  { id: uid(), kind: "bullet", text: "All systems go" },
  { id: uid(), kind: "h2", text: "Action Items" },
  { id: uid(), kind: "task", text: "Lisa — Draft Product Hunt post", done: false },
  { id: uid(), kind: "task", text: "Emily — Share customer quotes", done: false },
  { id: uid(), kind: "task", text: "David — Monitor Stripe webhook", done: false },
];

// Ref-stable contentEditable that doesn't fight the cursor.
const Editable = ({ value, onChange, placeholder, className, style, tag = "div" }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);
  const Tag = tag;
  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={className}
      style={style}
      onInput={(e) => onChange(e.currentTarget.textContent)}
      spellCheck={false}
    />
  );
};

const cycleAgenda = (s) =>
  s === "not-started" ? "active" : s === "active" ? "done" : "not-started";

const NotesDoc = ({ doc, setDoc, saveState }) => {
  const updateBlock = (id, patch) =>
    setDoc((d) => d.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const insertBlock = (afterId, kind = "para") => {
    const newBlock = { id: uid(), kind, text: "" };
    if (kind === "task") newBlock.done = false;
    if (kind === "agenda") { newBlock.time = ""; newBlock.status = "not-started"; }
    setDoc((d) => {
      const idx = d.findIndex((b) => b.id === afterId);
      const next = [...d];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    return newBlock.id;
  };

  const removeBlock = (id) => setDoc((d) => d.filter((b) => b.id !== id));

  const onKeyDown = (e, b) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Same kind continues; for tasks/bullets/agenda we keep type. For headings, drop to para.
      const nextKind = ["task", "bullet", "agenda"].includes(b.kind) ? b.kind : "para";
      insertBlock(b.id, nextKind);
    } else if (e.key === "Backspace" && (e.currentTarget.textContent || "").length === 0) {
      // Empty backspace removes block
      e.preventDefault();
      removeBlock(b.id);
    }
  };

  return (
    <div className="rail-card notes">
      <div className="notes-toolbar">
        <button className="tool label" title="Heading 1">H1</button>
        <button className="tool label" title="Heading 2">H2</button>
        <button className="tool label" title="Heading 3">H3</button>
        <span className="sep" />
        <button className="tool" title="Bullet list"><IconList size={15} /></button>
        <button className="tool" title="Numbered"><IconListNum size={15} /></button>
        <button className="tool" title="Task"><IconCheckbox size={15} /></button>
        <span className="sep" />
        <button className="tool" title="Link"><IconLink size={15} /></button>
        <button className="tool" title="Image"><IconImage size={15} /></button>
        <button className="tool" title="Code"><IconCode size={15} /></button>
        <button className="tool" style={{ marginLeft: "auto" }} title="Expand"><IconExpand size={15} /></button>
      </div>

      <div className="doc">
        {doc.map((b) => {
          if (b.kind === "h1") {
            return (
              <Editable
                key={b.id}
                tag="h1"
                className="block h1"
                value={b.text}
                placeholder="Untitled"
                onChange={(v) => updateBlock(b.id, { text: v })}
              />
            );
          }
          if (b.kind === "h2") {
            return (
              <Editable
                key={b.id}
                tag="h2"
                className="block h2"
                value={b.text}
                placeholder="Section heading"
                onChange={(v) => updateBlock(b.id, { text: v })}
              />
            );
          }
          if (b.kind === "h3") {
            return (
              <Editable
                key={b.id}
                tag="h3"
                className="block h3"
                value={b.text}
                placeholder="Subheading"
                onChange={(v) => updateBlock(b.id, { text: v })}
              />
            );
          }
          if (b.kind === "bullet") {
            return (
              <div className="block bullet" key={b.id}>
                <span className="bullet-dot" />
                <Editable
                  className="block-text"
                  value={b.text}
                  placeholder="List item"
                  onChange={(v) => updateBlock(b.id, { text: v })}
                />
              </div>
            );
          }
          if (b.kind === "task") {
            return (
              <div className={`block task ${b.done ? "done" : ""}`} key={b.id}>
                <button
                  className={`checkbox ${b.done ? "checked" : ""}`}
                  onClick={() => updateBlock(b.id, { done: !b.done })}
                  aria-label="Toggle task"
                >
                  {b.done && <IconCheck size={11} stroke={2.6} />}
                </button>
                <Editable
                  className="block-text"
                  value={b.text}
                  placeholder="To do"
                  onChange={(v) => updateBlock(b.id, { text: v })}
                />
              </div>
            );
          }
          if (b.kind === "agenda") {
            return (
              <div className={`block agenda ${b.status}`} key={b.id}>
                <button
                  className={`agenda-status ${b.status}`}
                  onClick={() => updateBlock(b.id, { status: cycleAgenda(b.status) })}
                  aria-label="Toggle agenda status"
                >
                  {b.status === "done" && <IconCheck size={11} stroke={2.6} />}
                </button>
                <Editable
                  className="block-text"
                  value={b.text}
                  placeholder="Agenda item"
                  onChange={(v) => updateBlock(b.id, { text: v })}
                />
                <Editable
                  className="agenda-time-edit"
                  value={b.time || ""}
                  placeholder="—"
                  onChange={(v) => updateBlock(b.id, { time: v })}
                />
              </div>
            );
          }
          // para
          return (
            <Editable
              key={b.id}
              className="block para"
              value={b.text}
              placeholder="Type / for commands"
              onChange={(v) => updateBlock(b.id, { text: v })}
            />
          );
        })}
      </div>

      <div className="notes-foot">
        <span style={{ fontSize: 11, color: "var(--ink-4)" }}>
          Tasks sync to Tasks tab · Agenda items appear in summary
        </span>
        <div className={`save-status ${saveState === "saving" ? "saving" : ""}`}>
          <span className="ok-dot" />
          {saveState === "saving" ? "Saving…" : "Saved just now"}
        </div>
      </div>
    </div>
  );
};

window.NotesDoc = NotesDoc;
window.DEFAULT_DOC = DEFAULT_DOC;

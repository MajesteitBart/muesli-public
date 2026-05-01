// App — root component, state, simulated live transcription

const INITIAL_TRANSCRIPT = [
  { id: 1, type: "speech", time: "10:01 AM", speaker: "James Stewart", initials: "JS", speakerColor: 1,
    text: "Thanks everyone for joining. Today we're finalizing our Product Hunt launch strategy and going over the product messaging." },
  { id: 2, type: "speech", time: "10:02 AM", speaker: "Emily Chen", initials: "EC", speakerColor: 2,
    text: "I've pulled together analytics from our beta users. The feedback has been really positive around the AI summarization." },
  { id: 3, type: "speech", time: "10:03 AM", speaker: "David Wilson", initials: "DW", speakerColor: 3,
    text: "Great. On the technical side, everything is on track for a May 20th launch. We've optimized load times and fixed the export bug." },
  { id: 4, type: "speech", time: "10:04 AM", speaker: "Lisa Martinez", initials: "LM", speakerColor: 4,
    text: "For the Product Hunt post, I suggest we lead with the time-saving aspect. Something like \"Save 5+ hours a week on meetings.\"" },
  { id: 5, type: "speech", time: "10:05 AM", speaker: "James Stewart", initials: "JS", speakerColor: 1,
    text: "Love that angle. Let's also highlight the clean UI and integrations. Those are strong differentiators." },
  { id: 6, type: "speech", time: "10:06 AM", speaker: "Emily Chen", initials: "EC", speakerColor: 2,
    text: "I can share customer quotes too. We have a few great ones about how it transformed their workflow." },
  { id: 7, type: "speech", time: "10:07 AM", speaker: "David Wilson", initials: "DW", speakerColor: 3,
    text: "One thing to note — our Stripe webhook retries issue is resolved, so payments are stable." },
];

const SIMULATED_LINES = [
  { speaker: "Lisa Martinez", initials: "LM", color: 4,
    text: "Should we coordinate the social push to go live the same morning as the Product Hunt launch?" },
  { speaker: "James Stewart", initials: "JS", color: 1,
    text: "Yes — let's queue everything for 12:01 AM Pacific. Lisa, can you draft the LinkedIn and X posts by Friday?" },
  { speaker: "Emily Chen", initials: "EC", color: 2,
    text: "I'll line up the customer quote graphics so they slot into the same thread." },
];

const MEETINGS = [
  { id: "m1", title: "Product Hunt Launch Meeting", time: "10:00 AM", duration: "1h 24m", group: "Today", recording: true },
  { id: "m2", title: "Q2 Marketing Strategy", time: "9:00 AM", duration: "45m", group: "Today" },
  { id: "m3", title: "Engineering Standup", time: "Yesterday", duration: "30m", group: "Today" },
  { id: "m4", title: "Investor Update Call", time: "May 12", duration: "1h 15m", group: "This week" },
  { id: "m5", title: "User Research Sync", time: "May 12", duration: "50m", group: "This week" },
  { id: "m6", title: "Design Critique", time: "May 11", duration: "1h", group: "This week" },
  { id: "m7", title: "All Hands", time: "May 9", duration: "1h 30m", group: "Last week" },
  { id: "m8", title: "Sales Training", time: "May 8", duration: "45m", group: "Last week" },
];

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "showWaveform": true,
  "compactSidebar": false,
  "accentHue": 275,
  "showPrivateNotePreset": true
}/*EDITMODE-END*/;

const App = () => {
  const [tweaks, setTweak] = useTweaks(DEFAULTS);
  const [tab, setTab] = React.useState("transcript");
  const [activeMeetingId, setActiveMeetingId] = React.useState("m1");
  const [recState, setRecState] = React.useState("recording");
  const [recSeconds, setRecSeconds] = React.useState(5076);
  const [transcript, setTranscript] = React.useState(INITIAL_TRANSCRIPT);
  const [partial, setPartial] = React.useState("");
  const [partialMeta, setPartialMeta] = React.useState(null);
  const [doc, setDoc] = React.useState(window.DEFAULT_DOC);
  const [saveState, setSaveState] = React.useState("saved");
  const saveTimer = React.useRef(null);

  React.useEffect(() => {
    const h = tweaks.accentHue;
    document.documentElement.style.setProperty("--accent", `oklch(0.52 0.18 ${h})`);
    document.documentElement.style.setProperty("--accent-soft", `oklch(0.95 0.04 ${h})`);
    document.documentElement.style.setProperty("--accent-ink", `oklch(0.42 0.18 ${h})`);
  }, [tweaks.accentHue]);

  React.useEffect(() => {
    if (recState !== "recording") return;
    const id = setInterval(() => setRecSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [recState]);

  React.useEffect(() => {
    if (recState !== "recording") return;
    let cancelled = false;
    let idx = 0;
    const cycle = async () => {
      while (!cancelled) {
        await new Promise(r => setTimeout(r, 7000));
        if (cancelled) return;
        const line = SIMULATED_LINES[idx % SIMULATED_LINES.length];
        idx++;
        const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());
        setPartialMeta({ name: line.speaker, initials: line.initials, color: line.color, time });
        let acc = "";
        for (let i = 0; i < line.text.length; i++) {
          if (cancelled) return;
          acc += line.text[i];
          setPartial(acc);
          await new Promise(r => setTimeout(r, 28));
        }
        if (cancelled) return;
        setTranscript(prev => [...prev, {
          id: Date.now() + Math.random(),
          type: "speech",
          time,
          speaker: line.speaker,
          initials: line.initials,
          speakerColor: line.color,
          text: line.text,
          fresh: true,
        }]);
        setPartial("");
        setPartialMeta(null);
      }
    };
    cycle();
    return () => { cancelled = true; };
  }, [recState]);

  React.useEffect(() => {
    setSaveState("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveState("saved"), 700);
    return () => clearTimeout(saveTimer.current);
  }, [doc]);

  const onSendComment = (text) => {
    const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());
    setTranscript(prev => [...prev, { id: Date.now(), type: "comment", time, text }]);
  };

  const currentTimeLabel = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());
  const taskCount = doc.filter(b => b.kind === "task" && !b.done).length;

  return (
    <>
      <div className="app">
        <Sidebar
          meetings={MEETINGS}
          activeMeetingId={activeMeetingId}
          onSelectMeeting={setActiveMeetingId}
        />
        <div className="main">
          <Header tab={tab} setTab={setTab} tabCounts={{ transcript: transcript.filter(e => e.type === "speech").length, tasks: taskCount }} />
          <div className="main-body">
            {tab === "transcript" && (
              <>
                <RecordingCard
                  state={recState}
                  time={recSeconds}
                  onPause={() => setRecState("paused")}
                  onResume={() => setRecState("recording")}
                  onStop={() => setRecState("idle")}
                  onStart={() => { setRecState("recording"); }}
                />
                <Transcript
                  entries={transcript}
                  partialText={partial}
                  partialSpeaker={partialMeta || { time: "", color: 1, initials: "", name: "" }}
                />
                <Composer onSend={onSendComment} currentTime={currentTimeLabel} />
              </>
            )}
            {tab === "summary" && <PlaceholderTab title="Summary" sub="Generated overview, decisions, risks and action items." />}
            {tab === "notes" && <PlaceholderTab title="Notes" sub="Focused full-screen notes editor lives here. Quick edits available in the right rail." />}
            {tab === "tasks" && <TasksView doc={doc} setDoc={setDoc} />}
          </div>
        </div>
        <aside className="rail">
          <NotesDoc doc={doc} setDoc={setDoc} saveState={saveState} />
        </aside>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Appearance">
          <TweakSlider label="Accent hue" value={tweaks.accentHue} min={0} max={360} step={5}
            onChange={(v) => setTweak("accentHue", v)} />
        </TweakSection>
        <TweakSection title="Recording">
          <TweakButton label="Set state: Recording" onClick={() => setRecState("recording")} />
          <TweakButton label="Set state: Paused" onClick={() => setRecState("paused")} />
          <TweakButton label="Set state: Idle" onClick={() => setRecState("idle")} />
        </TweakSection>
        <TweakSection title="Active tab">
          <TweakRadio
            value={tab}
            options={[
              { label: "Summary", value: "summary" },
              { label: "Transcript", value: "transcript" },
              { label: "Notes", value: "notes" },
              { label: "Tasks", value: "tasks" },
            ]}
            onChange={setTab}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

const PlaceholderTab = ({ title, sub }) => (
  <div style={{ padding: "40px 24px", color: "var(--ink-3)" }}>
    <div style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13.5, maxWidth: 480 }}>{sub}</div>
  </div>
);

const TasksView = ({ doc, setDoc }) => {
  const tasks = doc.map((b, i) => ({ ...b, idx: i })).filter(b => b.kind === "task");
  const toggle = (id) => setDoc(d => d.map(b => b.id === id ? { ...b, done: !b.done } : b));
  return (
    <div style={{ padding: "20px 24px", overflowY: "auto" }}>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 12 }}>
        Auto-extracted from notes · {tasks.length} items
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tasks.map((t) => (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px",
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: 10,
          }}>
            <button onClick={() => toggle(t.id)} style={{
              width: 16, height: 16, borderRadius: 5,
              border: t.done ? "none" : "1.5px solid var(--ink-4)",
              background: t.done ? "var(--ok)" : "transparent",
              display: "grid", placeItems: "center",
              cursor: "pointer",
            }}>
              {t.done && <IconCheck size={11} stroke={2.6} style={{ color: "white" }} />}
            </button>
            <div style={{
              fontSize: 13.5,
              color: t.done ? "var(--ink-3)" : "var(--ink)",
              textDecoration: t.done ? "line-through" : "none",
            }}>{t.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

window.App = App;
ReactDOM.createRoot(document.getElementById("root")).render(<App />);

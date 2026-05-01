// SVG icon set — minimal stroke icons
const Icon = ({ d, size = 16, stroke = 1.6, fill = "none", children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d ? <path d={d} /> : children}
  </svg>
);

const IconHome = (p) => <Icon {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></Icon>;
const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Icon>;
const IconInbox = (p) => <Icon {...p}><path d="M3 13h5l2 3h4l2-3h5" /><path d="M3 13l3-8h12l3 8v6H3z" /></Icon>;
const IconTemplate = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 9v12" /></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
const IconChev = (p) => <Icon {...p}><path d="M6 9l6 6 6-6" /></Icon>;
const IconShare = (p) => <Icon {...p}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></Icon>;
const IconMore = (p) => <Icon {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Icon>;
const IconPause = (p) => <Icon {...p}><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" /></Icon>;
const IconPlay = (p) => <Icon {...p}><path d="M7 5l12 7-12 7z" fill="currentColor" stroke="none" /></Icon>;
const IconStop = (p) => <Icon {...p}><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" /></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="M5 12l5 5 9-11" /></Icon>;
const IconSend = (p) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>;
const IconSpark = (p) => <Icon {...p}><path d="M12 3l1.6 4.5L18 9l-4.4 1.5L12 15l-1.6-4.5L6 9l4.4-1.5L12 3z" fill="currentColor" stroke="none" /></Icon>;
const IconWaveSm = (p) => <Icon {...p}><path d="M4 12h2M8 8v8M12 5v14M16 9v6M20 12h0" /></Icon>;
const IconPin = (p) => <Icon {...p}><path d="M12 2v6M9 8h6l1 6h-8l1-6zM12 14v8" /></Icon>;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;

// Markdown toolbar icons
const IconH = (p) => <Icon {...p}><path d="M6 4v16M18 4v16M6 12h12" /></Icon>;
const IconList = (p) => <Icon {...p}><circle cx="5" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="5" cy="18" r="1" fill="currentColor" stroke="none" /><path d="M10 6h11M10 12h11M10 18h11" /></Icon>;
const IconListNum = (p) => <Icon {...p}><path d="M10 6h11M10 12h11M10 18h11M4 5h2v3M4 11h2.5l-2.5 3H7M4 17h2.5a1 1 0 1 1 0 2H4" /></Icon>;
const IconCheckbox = (p) => <Icon {...p}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 12l3 3 5-6" /></Icon>;
const IconLink = (p) => <Icon {...p}><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 1 0 5.66 5.66l1.5-1.5" /></Icon>;
const IconImage = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="1.5" /><path d="M21 16l-5-5-9 9" /></Icon>;
const IconCode = (p) => <Icon {...p}><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></Icon>;
const IconExpand = (p) => <Icon {...p}><path d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6" /></Icon>;

Object.assign(window, {
  IconHome, IconSearch, IconInbox, IconTemplate, IconSettings,
  IconPlus, IconChev, IconShare, IconMore, IconPause, IconPlay, IconStop,
  IconCheck, IconSend, IconSpark, IconWaveSm, IconPin, IconClock,
  IconH, IconList, IconListNum, IconCheckbox, IconLink, IconImage, IconCode, IconExpand,
});

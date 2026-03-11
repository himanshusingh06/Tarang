type Accent = {
  primary: string;
  soft: string;
  glow: string;
  border: string;
};

const ACCENTS: Accent[] = [
  {
    primary: "#E6C67A",
    soft: "rgba(230, 198, 122, 0.25)",
    glow: "rgba(230, 198, 122, 0.35)",
    border: "rgba(230, 198, 122, 0.35)"
  },
  {
    primary: "#9FD8CC",
    soft: "rgba(159, 216, 204, 0.22)",
    glow: "rgba(159, 216, 204, 0.35)",
    border: "rgba(159, 216, 204, 0.32)"
  },
  {
    primary: "#F2B7B7",
    soft: "rgba(242, 183, 183, 0.22)",
    glow: "rgba(242, 183, 183, 0.35)",
    border: "rgba(242, 183, 183, 0.32)"
  },
  {
    primary: "#B9C8F0",
    soft: "rgba(185, 200, 240, 0.22)",
    glow: "rgba(185, 200, 240, 0.35)",
    border: "rgba(185, 200, 240, 0.32)"
  },
  {
    primary: "#BDE3A7",
    soft: "rgba(189, 227, 167, 0.22)",
    glow: "rgba(189, 227, 167, 0.35)",
    border: "rgba(189, 227, 167, 0.32)"
  },
  {
    primary: "#F0C2A6",
    soft: "rgba(240, 194, 166, 0.22)",
    glow: "rgba(240, 194, 166, 0.35)",
    border: "rgba(240, 194, 166, 0.32)"
  }
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 0x7fffffff;
  }
  return hash;
}

export function pickAccent(key: string) {
  if (!key) return ACCENTS[0];
  const idx = hashString(key) % ACCENTS.length;
  return ACCENTS[idx];
}

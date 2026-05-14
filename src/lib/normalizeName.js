export const PLAYER_ALIASES = {
  matthewfitzpatrick: "mattfitzpatrick",
  kimsiwoo: "siwookim",
  imsungjae: "sungjaeim",
  leeminwoo: "minwoolee",
  johnnykeefer: "johnkeefer",
  benjamingriffin: "bengriffin",
  ludvigaberg: "ludvigaberg",
  nicolaihojgaard: "nicolaihojgaard",
  rasmushojgaard: "rasmushojgaard",
  samivalimaki: "samivalimaki",
};

export function normalizeName(name) {
  if (!name) return "";

  let normalized = String(name).toLowerCase();

  normalized = normalized
    .replace(/å/g, "a")
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/œ/g, "oe");

  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  normalized = normalized.replace(/[^a-z]/g, "");

  return PLAYER_ALIASES[normalized] || normalized;
}

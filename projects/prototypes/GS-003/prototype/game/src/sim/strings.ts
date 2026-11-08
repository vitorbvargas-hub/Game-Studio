// Chaves de texto que todo content pack deve fornecer em strings.json.
// O motor só conhece as chaves; o texto (e o idioma) é do pacote.

export const REQUIRED_STRINGS = [
  "title", "player", "creature", "currency", "area", "boss", "evolve", "sync",
  "challengeBoss", "rematch", "victories", "speed", "save", "newGame", "confirmNewGame",
  "pack", "travel", "lockedLevel", "level",
  "offlineTitle", "offlineCredited", "offlineCapped", "offlineGains", "offlineLevelUps", "continue",
  "logVictory", "logLevelUp", "logEvolutionReady", "logEvolved", "logRetreat", "logBossDefeated", "logSync", "logTravel",
  "decisionStart", "decisionThreshold", "decisionPrompt",
] as const;

/** Chaves exigidas só quando o pacote liga o sistema correspondente (theme.starterOptions, area.encounterChoice, balance.scan, balance.training). */
export const STARTER_STRINGS = ["starterTitle", "starterPrompt", "starterEvolvesTo", "logStarter"] as const;
export const ENCOUNTER_STRINGS = ["encounterTitle", "encounterPrompt", "encounterAuto"] as const;
export const SCAN_STRINGS = ["scan", "logScan", "logRecruited"] as const;
export const TRAINING_STRINGS = ["training", "trainAtk", "trainDef", "trainSpd", "logTrainingReady"] as const;

export type StringKey = (typeof REQUIRED_STRINGS)[number];

/** Substitui {chave} por vars[chave]. Chave ausente no pacote aparece como [chave]. */
export function fmt(strings: Record<string, string>, key: string, vars: Record<string, string | number> = {}): string {
  const tpl = strings[key];
  if (tpl === undefined) return `[${key}]`;
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

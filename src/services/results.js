const TEXTURE_SLUGS = {
  Hearth: "hearth",
  Bond: "bond",
  Ache: "ache",
  Surge: "surge",
  Abyss: "abyss",
  Gauntlet: "gauntlet",
  "Art of War": "art_of_war",
  Web: "web",
  Mythical: "mythical",
  Threshold: "threshold",
  Populace: "populace",
  Inner: "inner",
  Cunning: "cunning",
  "The Novel": "the_novel",
};

const WHY_SLUGS = {
  Recognition: "recognition",
  Repair: "repair",
  "Controlled confrontation": "controlled_confrontation",
  "Moral clarification": "moral_clarification",
  "Justice hunger": "justice_hunger",
  "Identity rehearsal": "identity_rehearsal",
  "Shadow integration": "shadow_integration",
  "Intensity regulation": "intensity_regulation",
  Belonging: "belonging",
  "Meaning-making": "meaning_making",
  Catharsis: "catharsis",
  "Cognitive stimulation": "cognitive_stimulation",
  "Wonder and awe": "wonder_and_awe",
};

const SOULCHARACTER_YEARNING_GROUPS = {
  "To be loved": "GROUP_A",
  "To belong": "GROUP_A",
  "To be seen": "GROUP_A",
  "To feel worthy": "GROUP_A",
  "To feel peace": "GROUP_A",
  "To find peace": "GROUP_A",
  "To be free": "GROUP_B",
  "To change": "GROUP_B",
  "To discover": "GROUP_B",
  "To leave an impact": "GROUP_C",
  "To have impact": "GROUP_C",
  "To redeem": "GROUP_C",
  "To preserve": "GROUP_C",
};

const SOULCHARACTER_LOOKUP = {
  Hearth: { GROUP_A: "winnie_the_pooh", GROUP_B: "cinderella", GROUP_C: "anne_shirley" },
  Bond: { GROUP_A: "elizabeth_bennet", GROUP_B: "juliet", GROUP_C: "guinevere" },
  Ache: { GROUP_A: "quasimodo", GROUP_B: "anna_karenina", GROUP_C: "orpheus" },
  Surge: { GROUP_A: "helen_of_troy", GROUP_B: "icarus", GROUP_C: "cleopatra" },
  Abyss: { GROUP_A: "frankensteins_creature", GROUP_B: "mr_hyde", GROUP_C: "dracula" },
  Gauntlet: { GROUP_A: "odysseus", GROUP_B: "mowgli", GROUP_C: "hercules" },
  "Art of War": { GROUP_A: "hector", GROUP_B: "athena", GROUP_C: "achilles" },
  Web: { GROUP_A: "morgan_le_fay", GROUP_B: "loki", GROUP_C: "macbeth" },
  Mythical: { GROUP_A: "persephone", GROUP_B: "circe", GROUP_C: "merlin" },
  Threshold: { GROUP_A: "dorothy", GROUP_B: "alice", GROUP_C: "alice" },
  Populace: { GROUP_A: "jean_valjean", GROUP_B: "robin_hood", GROUP_C: "antigone" },
  Inner: { GROUP_A: "jane_eyre", GROUP_B: "nora_helmer", GROUP_C: "hamlet" },
  Cunning: { GROUP_A: "aladdin", GROUP_B: "sherlock_holmes", GROUP_C: "sherlock_holmes" },
  "The Novel": { GROUP_A: "prospero", GROUP_B: "don_quixote", GROUP_C: "scheherazade" },
};

const SOULCHARACTER_NAMES = {
  achilles: "Achilles",
  aladdin: "Aladdin",
  alice: "Alice",
  anna_karenina: "Anna Karenina",
  anne_shirley: "Anne Shirley",
  antigone: "Antigone",
  athena: "Athena",
  cinderella: "Cinderella",
  circe: "Circe",
  cleopatra: "Cleopatra",
  don_quixote: "Don Quixote",
  dorothy: "Dorothy",
  dracula: "Dracula",
  elizabeth_bennet: "Elizabeth Bennet",
  frankensteins_creature: "Frankenstein's Creature",
  guinevere: "Guinevere",
  hamlet: "Hamlet",
  hector: "Hector",
  helen_of_troy: "Helen of Troy",
  hercules: "Hercules",
  icarus: "Icarus",
  jane_eyre: "Jane Eyre",
  jean_valjean: "Jean Valjean",
  juliet: "Juliet",
  loki: "Loki",
  macbeth: "Macbeth",
  merlin: "Merlin",
  morgan_le_fay: "Morgan le Fay",
  mowgli: "Mowgli",
  mr_hyde: "Mr. Hyde",
  nora_helmer: "Nora Helmer",
  odysseus: "Odysseus",
  orpheus: "Orpheus",
  persephone: "Persephone",
  prospero: "Prospero",
  puss_in_boots: "Puss in Boots",
  quasimodo: "Quasimodo",
  robin_hood: "Robin Hood",
  scheherazade: "Scheherazade",
  sherlock_holmes: "Sherlock Holmes",
  winnie_the_pooh: "Winnie the Pooh",
};

const HOUSE_BY_TEXTURE = {
  Inner: "Mind",
  Populace: "Mind",
  "The Novel": "Mind",
  Hearth: "Heart",
  Bond: "Heart",
  Ache: "Heart",
  Surge: "Body",
  Abyss: "Body",
  Web: "Body",
  Mythical: "Soul",
  Threshold: "Soul",
  Gauntlet: "Soul",
  "Art of War": "Soul",
  Cunning: "Soul",
};

const YEARNINGS = [
  "To be loved",
  "To belong",
  "To feel worthy",
  "To be seen",
  "To have impact",
  "To be free",
  "To change",
  "To find peace",
  "To preserve",
  "To discover",
  "To redeem",
];

const WHY_LOOKUP = {
  Hearth: ["Repair", "Repair", "Repair", "Recognition", "Repair", "Intensity regulation", "Identity rehearsal", "Intensity regulation", "Repair", "Intensity regulation", "Repair"],
  Bond: ["Identity rehearsal", "Repair", "Identity rehearsal", "Recognition", "Identity rehearsal", "Intensity regulation", "Identity rehearsal", "Intensity regulation", "Repair", "Cognitive stimulation", "Repair"],
  Ache: ["Controlled confrontation", "Controlled confrontation", "Recognition", "Recognition", "Meaning-making", "Controlled confrontation", "Meaning-making", "Catharsis", "Meaning-making", "Recognition", "Catharsis"],
  Surge: ["Intensity regulation", "Intensity regulation", "Identity rehearsal", "Identity rehearsal", "Identity rehearsal", "Intensity regulation", "Intensity regulation", "Intensity regulation", "Controlled confrontation", "Intensity regulation", "Catharsis"],
  Abyss: ["Controlled confrontation", "Recognition", "Shadow integration", "Recognition", "Shadow integration", "Intensity regulation", "Controlled confrontation", "Catharsis", "Controlled confrontation", "Wonder and awe", "Moral clarification"],
  Gauntlet: ["Controlled confrontation", "Repair", "Identity rehearsal", "Recognition", "Identity rehearsal", "Identity rehearsal", "Identity rehearsal", "Controlled confrontation", "Identity rehearsal", "Recognition", "Identity rehearsal"],
  "Art of War": ["Repair", "Belonging", "Identity rehearsal", "Recognition", "Shadow integration", "Shadow integration", "Controlled confrontation", "Meaning-making", "Moral clarification", "Moral clarification", "Moral clarification"],
  Web: ["Controlled confrontation", "Identity rehearsal", "Identity rehearsal", "Controlled confrontation", "Shadow integration", "Identity rehearsal", "Identity rehearsal", "Meaning-making", "Controlled confrontation", "Cognitive stimulation", "Justice hunger"],
  Mythical: ["Identity rehearsal", "Meaning-making", "Identity rehearsal", "Identity rehearsal", "Identity rehearsal", "Wonder and awe", "Identity rehearsal", "Meaning-making", "Meaning-making", "Wonder and awe", "Moral clarification"],
  Threshold: ["Wonder and awe", "Repair", "Identity rehearsal", "Recognition", "Identity rehearsal", "Wonder and awe", "Identity rehearsal", "Intensity regulation", "Controlled confrontation", "Wonder and awe", "Identity rehearsal"],
  Populace: ["Moral clarification", "Belonging", "Moral clarification", "Recognition", "Moral clarification", "Justice hunger", "Meaning-making", "Meaning-making", "Meaning-making", "Cognitive stimulation", "Justice hunger"],
  Inner: ["Repair", "Belonging", "Shadow integration", "Recognition", "Meaning-making", "Shadow integration", "Meaning-making", "Meaning-making", "Meaning-making", "Cognitive stimulation", "Moral clarification"],
  Cunning: ["Identity rehearsal", "Repair", "Identity rehearsal", "Identity rehearsal", "Shadow integration", "Shadow integration", "Identity rehearsal", "Intensity regulation", "Identity rehearsal", "Cognitive stimulation", "Justice hunger"],
  "The Novel": ["Meaning-making", "Belonging", "Meaning-making", "Recognition", "Meaning-making", "Wonder and awe", "Wonder and awe", "Intensity regulation", "Meaning-making", "Cognitive stimulation", "Meaning-making"],
};

const FLAVOUR_ALIASES = {
  fantasy_epic_quests: "Epic Quests",
  fantasy_clever_sparks: "Clever Sparks",
  fantasy_lone_wolves: "Lone Wolves",
  fantasy_wartime_epics: "Wartime Epics",
  fantasy_blazing_trials: "Blazing Trials",
  fantasy_cosy_realms: "Cosy Realms",
  fantasy_cozy_realms: "Cosy Realms",
  fantasy_whispers_wonders: "Whispers & Wonders",
  fantasy_sacred_myths: "Sacred Myths",
  fantasy_weird: "Weird",
  fantasy_dark_academia: "Dark Academia",
  fantasy_dark_labyrinths: "Dark Labyrinths",
  fantasy_hidden_realms: "Hidden Realms",
  fantasy_urban_frontline: "Urban Frontline",
  sci_space_opera: "Space Opera",
  sci_cyber: "Cyber",
  sci_science_heavy: "Science-Heavy",
  sci_afterworld: "Afterworld",
  sci_first_contact: "First Contact",
  sci_strange: "The Strange",
  rom_enemies_to_lovers: "Enemies to Lovers",
  rom_power_play: "Power Play",
  rom_conflict_obsession: "Dark Obsession",
  rom_healing_love: "Healing Love",
  rom_forbidden_love: "Forbidden Love",
  rom_star_crossed: "Star-Crossed",
  rom_fated_bonds: "Fated Bonds",
  rom_slow_burn: "Slow Burn",
  rom_protector_protected: "Protected & Protective",
  rom_outsider_political: "Political Intrigue",
  rce_conflict_enemies: "Enemies to Lovers",
  rce_conflict_powerplay: "Power Play",
  rce_conflict_obsession: "Dark Obsession",
  rce_bond_secondchance: "Second Chance",
  rce_outsider_forbidden: "Forbidden Love",
  rce_outsider_starcrossed: "Star-Crossed",
  rce_sanctuary_healing: "Healing Love",
  rce_sanctuary_protected: "Protected & Protective",
  rce_bond_slowburn: "Slow Burn",
  hist_ancient_egypt: "Egypt",
  hist_ancient_greece: "Greece",
  hist_ancient_rome: "Rome",
  hist_ancient_persia: "Persia",
  hist_sword_vikings: "Vikings",
  hist_sword_crusades: "Crusades",
  hist_sword_islamic: "Islamic World",
  hist_sword_mongols: "Mongols",
  hist_sword_samurai: "Samurai",
  hist_gunpowder_renaissance: "Renaissance",
  hist_gunpowder_empire: "Age of Empire",
  hist_gunpowder_pirates: "Pirates",
  hist_gunpowder_napoleonic: "Napoleonic Wars",
  hist_gunpowder_wildwest: "American Wild West",
  hist_british_tudors: "Tudors",
  hist_british_regency: "Regency",
  hist_british_victorian: "Victorian Britain",
  hist_british_industrial: "Industrial Revolution",
  hist_recent_ww1: "WWI",
  hist_recent_ww2: "WWII",
  hist_recent_coldwar: "Cold War",
  hist_recent_liberation: "Liberation",
  hist_recent_late20th: "Late 20th",
  cont_family_secrets: "Family Secrets & Legacy",
  cont_family_caregiving: "When It Falls To You",
  cont_family_breaking: "Breaking the Pattern",
  cont_love_unravelling: "The Slow Unravelling",
  cont_love_modern: "Modern Love",
  cont_love_friendships: "Deep Friendships",
  cont_identity_race: "Caught Between Worlds",
  cont_identity_gender: "Sex, Gender & Desire",
  cont_identity_reinvention: "Reinvention",
  cont_mind_crisis: "The Quiet Crisis",
  cont_mind_grief: "Grief & Loss",
  cont_mind_wounds: "Old Wounds",
  cont_society_survival: "Modern Survival",
  cont_society_unequal: "An Unequal World",
  cont_society_digital: "Digital Loneliness",
  cont_society_crisis: "A World in Crisis",
};

const VISUAL_ALIASES = {
  rom_visual_blazing: "Blazing Trials",
  rom_visual_feral: "Feral Magic",
  rom_visual_soft: "Soft Spellwork",
  rom_visual_royal: "Royal Intrigue",
  rom_visual_nocturne: "Nocturne",
};

function unwrap(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if ("value" in value) return value.value;
    if (Object.keys(value).length === 0) return undefined;
  }
  return value;
}

function read(source, path) {
  const direct = source?.[path];
  if (direct !== undefined) return unwrap(direct);
  return unwrap(path.split(".").reduce((value, key) => value?.[key], source));
}

function first(source, paths) {
  for (const path of paths) {
    const value = read(source, path);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function oneOf(value, values) {
  return values.includes(value);
}

function normalizeInputs(submission) {
  const genreRaw = String(first(submission, ["desire.genre_calling"]) || "").trim();
  const genre = {
    "Science Fiction": "Sci-Fi",
    "Sci Fi": "Sci-Fi",
    "Historical Fiction": "Historical",
    "Literary Fiction": "Literary",
  }[genreRaw] || genreRaw;
  const plotRaw = String(first(submission, ["desire.plot_engine"]) || "").trim();
  const plotEngine = {
    bond: "To the Bond", throne: "To the Throne", truth: "To the Truth",
    self: "To the Self", survival: "To the Survival", death: "To the Death",
  }[plotRaw.toLowerCase()] || plotRaw;
  const sensitivityRaw = String(first(submission, ["desire.sensitivity"]) || "").trim();
  const sensitivity = { Gentle: "Soft", Testing: "Medium", Unflinching: "Hard" }[sensitivityRaw] || sensitivityRaw;
  const ageRaw = String(first(submission, ["reader_context.age_stage"]) || "").trim();
  const ageStage = { A: "Adult", NA: "NA", YA: "YA" }[ageRaw] || ageRaw;
  const yearningRaw = String(first(submission, ["yearning.final"]) || "").trim();
  const yearning = {
    "To feel peace": "To find peace",
    "To leave an impact": "To have impact",
    "To have an impact": "To have impact",
  }[yearningRaw] || yearningRaw;
  const flavourPaths = oneOf(genre, ["Historical", "Literary", "Contemporary"])
    ? ["desire.genre_flavour", "desire.genre_subflavour", "desire.genre_cluster"]
    : ["desire.genre_subflavour", "desire.genre_flavour", "desire.genre_cluster"];
  const flavourRaw = String(first(submission, flavourPaths) || "").trim();
  const visualRaw = String(first(submission, ["desire.genre_visual"]) || "").trim();
  const depthRaw = String(first(submission, ["desire.literary_depth"]) || "").trim();
  const depthScoreRaw = first(submission, ["desire.literary_depth_score"]);
  const depthScore = depthScoreRaw === "" ? NaN : Number(depthScoreRaw);
  const literaryDepth = depthRaw || (Number.isFinite(depthScore)
    ? depthScore <= 4 ? "Commercial" : depthScore <= 6 ? "Mixed" : "Literary"
    : "");
  return {
    genre,
    flavour: FLAVOUR_ALIASES[flavourRaw] || flavourRaw,
    plotEngine,
    tone: String(first(submission, ["desire.tone"]) || "").trim(),
    pacing: String(first(submission, ["desire.pacing"]) || "").trim(),
    literaryDepth,
    sensitivity,
    ageStage,
    yearning,
    visual: VISUAL_ALIASES[visualRaw] || visualRaw,
  };
}

function fantasyTexture(i) {
  const { flavour: f, plotEngine: p, tone: t, sensitivity: s, literaryDepth: d } = i;
  if (f === "Epic Quests") return p === "To the Death" ? "Art of War" : p === "To the Truth" ? "Threshold" : "Mythical";
  if (f === "Clever Sparks") return p === "To the Throne" && oneOf(t, ["Tense", "Heavy"]) ? "Web" : "Cunning";
  if (f === "Lone Wolves") return p === "To the Self" && d === "Literary" ? "Inner" : s === "Hard" ? "Abyss" : "Gauntlet";
  if (f === "Wartime Epics") return p === "To the Truth" ? "Web" : oneOf(p, ["To the Bond", "To the Self"]) ? "Ache" : "Art of War";
  if (f === "Blazing Trials") return "Gauntlet";
  if (f === "Cosy Realms") return "Hearth";
  if (f === "Whispers & Wonders") return oneOf(p, ["To the Death", "To the Throne"]) ? "Mythical" : t === "Warm" && (oneOf(p, ["To the Bond", "To the Self"]) || s === "Soft") ? "Hearth" : "Threshold";
  if (f === "Sacred Myths") return "Mythical";
  if (f === "Weird") return p === "To the Self" && d === "Literary" ? "Inner" : p === "To the Truth" && d === "Literary" ? "Populace" : s === "Hard" && oneOf(t, ["Heavy", "Tense"]) ? "Abyss" : "Threshold";
  if (f === "Dark Academia") return d === "Literary" ? "Populace" : s === "Hard" && oneOf(t, ["Heavy", "Tense", "Melancholic"]) ? "Abyss" : "Web";
  if (f === "Dark Labyrinths") return d === "Literary" && p === "To the Truth" ? "Populace" : p === "To the Death" ? "Art of War" : "Web";
  if (f === "Hidden Realms") return oneOf(p, ["To the Death", "To the Throne"]) ? "Mythical" : s === "Soft" && oneOf(p, ["To the Bond", "To the Self"]) ? "Hearth" : "Threshold";
  if (f === "Urban Frontline") return p === "To the Throne" ? "Web" : "Cunning";
  return "Threshold";
}

function sciFiTexture(i) {
  const { flavour: f, plotEngine: p, tone: t, sensitivity: s, literaryDepth: d } = i;
  if (f === "Space Opera") return p === "To the Death" || (p === "To the Throne" && t === "Heavy") ? "Art of War" : p === "To the Throne" ? "Mythical" : "Threshold";
  if (f === "Cyber") return d === "Literary" ? "Populace" : oneOf(p, ["To the Truth", "To the Survival"]) && oneOf(t, ["Warm", "Playful"]) ? "Cunning" : s === "Hard" && oneOf(t, ["Heavy", "Melancholic"]) ? "Abyss" : "Web";
  if (f === "Science-Heavy") return p === "To the Survival" ? "Gauntlet" : p === "To the Truth" && oneOf(t, ["Warm", "Playful"]) ? "Cunning" : "Populace";
  if (f === "Afterworld") return oneOf(p, ["To the Throne", "To the Death"]) ? "Art of War" : oneOf(t, ["Melancholic", "Heavy", "Tense"]) && oneOf(p, ["To the Self", "To the Bond"]) ? "Ache" : d === "Literary" ? "Populace" : "Gauntlet";
  if (f === "First Contact") return p === "To the Truth" && d === "Literary" ? "Populace" : "Threshold";
  if (f === "The Strange") return p === "To the Self" && d === "Literary" ? "Inner" : d === "Literary" ? "Populace" : s === "Hard" && oneOf(t, ["Heavy", "Melancholic"]) ? "Abyss" : p === "To the Survival" ? "Gauntlet" : "Threshold";
  return "Threshold";
}

function romanceTexture(i) {
  const { flavour: f, plotEngine: p, tone: t, sensitivity: s, ageStage: a, visual: v } = i;
  if (oneOf(f, ["Enemies to Lovers", "Power Play", "Dark Obsession"]) && t === "Heavy" && s === "Hard" && a === "Adult") return "Surge";
  if (f === "Dark Obsession" && oneOf(p, ["To the Death", "To the Survival"])) return "Abyss";
  if (oneOf(f, ["Second Chance", "Forbidden Love", "Healing Love", "Star-Crossed"]) && t === "Melancholic") return "Ache";
  if (f === "Political Intrigue" || p === "To the Throne") return "Web";
  if (v === "Blazing Trials" && oneOf(p, ["To the Self", "To the Death"])) return "Gauntlet";
  if (p === "To the Self" && t === "Grounded") return "Inner";
  if (v === "Nocturne") return "Abyss";
  if (v === "Royal Intrigue") return "Web";
  if (oneOf(f, ["Healing Love", "Protected & Protective", "Fated Bonds", "Slow Burn"]) && t === "Warm" && s === "Soft") return v === "Nocturne" ? "Abyss" : "Hearth";
  return "Bond";
}

function historicalTexture(i) {
  const { flavour: f, plotEngine: p, tone: t, sensitivity: s, literaryDepth: d } = i;
  if (oneOf(f, ["Egypt", "Greece", "Persia", "Rome"])) return oneOf(p, ["To the Throne", "To the Truth"]) ? "Web" : p === "To the Death" ? "Art of War" : "Mythical";
  if (oneOf(f, ["Vikings", "Crusades", "Mongols", "Napoleonic Wars"])) return "Art of War";
  if (f === "Islamic World") return p === "To the Truth" ? "Populace" : p === "To the Bond" ? "Threshold" : "Art of War";
  if (f === "Samurai") return oneOf(p, ["To the Death", "To the Throne"]) ? "Art of War" : "Gauntlet";
  if (f === "Renaissance") return p === "To the Death" ? "Art of War" : "Web";
  if (f === "Age of Empire") return p === "To the Truth" && d === "Literary" ? "Populace" : oneOf(p, ["To the Bond", "To the Truth"]) ? "Threshold" : "Art of War";
  if (f === "Pirates") return oneOf(p, ["To the Death", "To the Survival", "To the Throne"]) ? "Gauntlet" : t === "Playful" ? "Cunning" : "Threshold";
  if (f === "American Wild West") return t === "Playful" ? "Cunning" : "Gauntlet";
  if (f === "Tudors") return p === "To the Death" ? "Art of War" : "Web";
  if (f === "Regency") return oneOf(t, ["Heavy", "Tense"]) && s === "Hard" ? "Abyss" : p === "To the Bond" ? "Bond" : "Web";
  if (f === "Victorian Britain") return oneOf(t, ["Heavy", "Tense"]) && s === "Hard" ? "Abyss" : p === "To the Bond" ? "Bond" : d === "Literary" ? "Populace" : "Web";
  if (f === "Industrial Revolution") return p === "To the Bond" ? "Bond" : oneOf(p, ["To the Death", "To the Throne"]) ? "Art of War" : "Populace";
  if (f === "WWI") return t === "Melancholic" || p === "To the Bond" ? "Ache" : "Art of War";
  if (f === "WWII") return p === "To the Truth" ? "Web" : t === "Melancholic" || p === "To the Bond" ? "Ache" : "Art of War";
  if (f === "Cold War") return d === "Literary" ? "Populace" : "Web";
  if (oneOf(f, ["Liberation", "Late 20th"])) return t === "Melancholic" ? "Ache" : "Populace";
  return "Art of War";
}

function literaryTexture(i) {
  const { flavour: f, plotEngine: p, tone: t, sensitivity: s, literaryDepth: d, visual: v, genre } = i;
  if (genre === "Literary") {
    if (v === "Psychological") return "Inner";
    if (v === "Satirical") return "Populace";
    if (oneOf(v, ["Experimental", "Postmodern", "Structural"]) && d === "Literary") return "The Novel";
    if (v === "Gothic" && t === "Heavy" && s === "Hard") return "Abyss";
  }
  if (f === "Family Secrets & Legacy") return p === "To the Truth" && t === "Tense" ? "Web" : t === "Melancholic" ? "Ache" : "Bond";
  if (f === "When It Falls To You") return p === "To the Bond" && oneOf(t, ["Heavy", "Melancholic"]) ? "Ache" : "Bond";
  if (f === "Breaking the Pattern") return d === "Literary" ? "Inner" : p === "To the Truth" ? "Threshold" : "Bond";
  if (oneOf(f, ["The Slow Unravelling", "Modern Love"])) return t === "Melancholic" ? "Ache" : "Bond";
  if (f === "Deep Friendships") return t === "Melancholic" ? "Ache" : t === "Warm" && s === "Soft" ? "Hearth" : "Bond";
  if (f === "Caught Between Worlds") return p === "To the Truth" ? "Populace" : "Inner";
  if (f === "Sex, Gender & Desire") return p === "To the Truth" && d === "Literary" ? "Populace" : "Inner";
  if (f === "Reinvention") return d === "Literary" ? "Inner" : "Threshold";
  if (f === "The Quiet Crisis") return "Inner";
  if (oneOf(f, ["Grief & Loss", "Old Wounds"])) return p === "To the Self" ? "Inner" : "Ache";
  if (oneOf(f, ["Modern Survival", "An Unequal World"])) return "Populace";
  if (f === "Digital Loneliness") return p === "To the Self" ? "Inner" : "Populace";
  if (f === "A World in Crisis") return t === "Melancholic" ? "Ache" : "Populace";
  return "Inner";
}

function computeTexture(i) {
  if (i.plotEngine === "To the Self" && i.literaryDepth === "Literary") return "Inner";
  if (oneOf(i.tone, ["Heavy", "Tense"])) {
    if (i.sensitivity === "Hard") {
      return oneOf(i.plotEngine, ["To the Death", "To the Survival"]) ? "Abyss" : "Surge";
    }
  }
  if (i.genre === "Fantasy") return fantasyTexture(i);
  if (i.genre === "Sci-Fi") return sciFiTexture(i);
  if (oneOf(i.genre, ["Romantasy", "Romance"])) return romanceTexture(i);
  if (i.genre === "Historical") return historicalTexture(i);
  if (oneOf(i.genre, ["Literary", "Contemporary"])) return literaryTexture(i);
  if (i.genre === "Horror") {
    if (i.plotEngine === "To the Survival") return "Gauntlet";
    if (i.tone === "Heavy" && i.sensitivity === "Hard" && !oneOf(i.plotEngine, ["To the Death", "To the Survival"])) return "Surge";
    return "Abyss";
  }
  return { Fantasy: "Threshold", "Sci-Fi": "Threshold", Romantasy: "Bond", Romance: "Bond", Historical: "Art of War", Literary: "Inner", Contemporary: "Inner", Horror: "Abyss" }[i.genre] || "Threshold";
}

function computeStyle(i) {
  const depth = i.literaryDepth;
  const styles = {
    "Fast|Commercial": "Devourer",
    "Fast|Mixed": "Sprinter",
    "Fast|Literary": "Deep Runner",
    "Medium|Commercial": "Immersed",
    "Medium|Mixed": "Reader",
    "Medium|Literary": "Contemplative",
    "Slow|Commercial": "Lingerer",
    "Slow|Mixed": "Measured",
    "Slow|Literary": "Devoted",
  };
  return styles[`${i.pacing}|${depth}`] || "Reader";
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function computeSoulCharacter(texture, yearning) {
  const group = SOULCHARACTER_YEARNING_GROUPS[yearning] || "GROUP_A";
  let character = SOULCHARACTER_LOOKUP[texture]?.[group]
    || SOULCHARACTER_LOOKUP[texture]?.GROUP_A
    || SOULCHARACTER_LOOKUP.Threshold.GROUP_A;

  if (texture === "Bond" && oneOf(yearning, ["To be loved", "To belong"])) character = "juliet";
  if (texture === "Ache" && oneOf(yearning, ["To feel peace", "To find peace"])) character = "orpheus";
  if (texture === "Art of War" && oneOf(yearning, ["To be seen", "To feel worthy"])) character = "achilles";
  if (texture === "Art of War" && oneOf(yearning, ["To preserve", "To redeem"])) character = "hector";
  if (texture === "Populace" && yearning === "To be seen") character = "antigone";
  if (texture === "Populace" && yearning === "To redeem") character = "jean_valjean";
  if (texture === "Inner" && oneOf(yearning, ["To feel peace", "To find peace"])) character = "hamlet";
  if (texture === "Cunning" && oneOf(yearning, ["To feel peace", "To find peace"])) character = "puss_in_boots";
  if (texture === "Cunning" && yearning === "To be free") character = "puss_in_boots";
  if (texture === "The Novel" && yearning === "To redeem") character = "prospero";

  return {
    name: SOULCHARACTER_NAMES[character],
    slug: character,
  };
}

function computeResults(submission) {
  const inputs = normalizeInputs(submission || {});
  const texture = computeTexture(inputs);
  const yearningIndex = Math.max(0, YEARNINGS.indexOf(inputs.yearning));
  const why = WHY_LOOKUP[texture]?.[yearningIndex] || WHY_LOOKUP[texture]?.[0] || "Recognition";
  const house = HOUSE_BY_TEXTURE[texture] || "Soul";
  const curator = {
    Mind: ["Lucas"],
    Heart: ["Claire"],
    Body: ["Riya"],
    Soul: ["Ahmed"],
  }[house];
  const style = computeStyle(inputs);
  const soulCharacter = computeSoulCharacter(texture, inputs.yearning);
  return {
    texture,
    why,
    style,
    house,
    curator,
    soulCharacter: soulCharacter.name,
    images: {
      soulCharacter: `soulcharacter_${soulCharacter.slug}.png`,
      texture: `story_texture_${TEXTURE_SLUGS[texture]}.png`,
      why: `why_you_read_${WHY_SLUGS[why]}.png`,
      style: `reading_style_${slug(style)}.png`,
      preHouse: "pre_house_reveal.png",
      house: `house_${slug(house)}.png`,
      grounding: `grounding_${slug(house)}.png`,
      gradient: `gradient_${slug(house)}.png`,
    },
  };
}

module.exports = {
  computeResults,
  computeSoulCharacter,
  normalizeInputs,
  TEXTURE_SLUGS,
  WHY_SLUGS,
  SOULCHARACTER_LOOKUP,
  HOUSE_BY_TEXTURE,
};

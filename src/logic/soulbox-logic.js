/*
 * SoulBox results logic (Logic and Data Spec, November 2026).
 *
 * Standalone: no Webflow, no server, no dependencies. Works in the browser
 * (window.SoulBoxLogic) and in Node (require). All tables from Sections 1 to 6
 * are at the top; edit a table without touching the functions underneath.
 * Every value is spelled exactly as in the spec.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SoulBoxLogic = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════════
  // TABLES
  // ══════════════════════════════════════════════════════════════════════════

  // 1.1 Genres (genre_calling)
  var GENRES = ['Fantasy', 'Science Fiction', 'Romance', 'Romantasy', 'Historical', 'Horror', 'Mystery', 'The Literary', 'Contemporary'];

  // Older quiz spellings → canonical genre (1.1).
  var GENRE_ALIASES = { 'Sci-Fi': 'Science Fiction', 'Historical Fiction': 'Historical', 'Literary': 'The Literary' };

  // 1.3 Archetypes, slugs and Houses
  var ARCHETYPES = {
    'Cupid': { slug: 'cupid', house: 'Heart' },
    'Empath': { slug: 'empath', house: 'Heart' },
    'Smutter': { slug: 'smutter', house: 'Body' },
    'Spectator': { slug: 'spectator', house: 'Body' },
    'Nihilist': { slug: 'nihilist', house: 'Body' },
    'Adrenaline Junkie': { slug: 'adrenaline-junkie', house: 'Body' },
    "Hero's Son": { slug: 'heros-son', house: 'Soul' },
    'Detective': { slug: 'detective', house: 'Soul' },
    'Adventurer': { slug: 'adventurer', house: 'Soul' },
    'Fiction Nerd': { slug: 'fiction-nerd', house: 'Soul' },
    'Pilgrim': { slug: 'pilgrim', house: 'Soul' },
    'Writer-Reader': { slug: 'writer-reader', house: 'Mind' },
    'Highbrow': { slug: 'highbrow', house: 'Mind' }
  };

  var HOUSES = {
    Heart: { image: 'house_of_heart', emblem: 'emblem_heart.png', colour: '#7F1006' },
    Body: { image: 'house_of_body', emblem: 'emblem_body.png', colour: '#271020' },
    Soul: { image: 'house_of_soul', emblem: 'emblem_soul.png', colour: '#041429' },
    Mind: { image: 'house_of_mind', emblem: 'emblem_mind.png', colour: '#0C2A15' }
  };

  // 1.4 Literary Grades
  var GRADES = {
    'A+': { name: 'Certified Snob', slug: 'a-plus' },
    'A': { name: 'Prose Addict', slug: 'a' },
    'B': { name: 'Sentence Collector', slug: 'b' },
    'C': { name: 'Double Agent', slug: 'c' },
    'D': { name: 'Page Devourer', slug: 'd' },
    'E': { name: 'Fiction Junkie', slug: 'e' },
    'F': { name: 'Plot Goblin', slug: 'f' }
  };

  // 2.1 Olympics points
  var OLYMPICS_POINTS = {
    q1_to_q4: { correct: 3, decoy: 1, optout: 0 },
    q5: { commercial: 2, upmarket: 4, literary: 6 }
  };

  // 2.2 Grade bands (editable). 17 cannot happen; if it does it counts as A.
  var GRADE_BANDS = [
    { min: 18, max: 18, grade: 'A+' },
    { min: 14, max: 17, grade: 'A' },
    { min: 12, max: 13, grade: 'B' },
    { min: 10, max: 11, grade: 'C' },
    { min: 7, max: 9, grade: 'D' },
    { min: 4, max: 6, grade: 'E' },
    { min: 2, max: 3, grade: 'F' }
  ];

  // Grades that pass the Writer-Reader check (4.4)
  var WRITER_READER_GRADES = ['A+', 'A', 'B'];

  // 1.5 Moral tiers and bands, by masks_total
  var MORAL_TIERS = {
    3: { tier: 'Cinnamon Roll', slug: 'cinnamon-roll', band: 'Light' },
    4: { tier: 'Golden Retriever', slug: 'golden-retriever', band: 'Light' },
    5: { tier: 'Reasonable Adult', slug: 'reasonable-adult', band: 'Grey' },
    6: { tier: 'Morally Grey', slug: 'morally-grey', band: 'Grey' },
    7: { tier: 'Menace', slug: 'menace', band: 'Grey' },
    8: { tier: 'Villain Era', slug: 'villain-era', band: 'Dark' },
    9: { tier: 'Unhinged', slug: 'unhinged', band: 'Dark' }
  };

  // 1.6 SoulCharacters: archetype × moral band → [name, slug]
  var SOUL_CHARACTERS = {
    'Cupid': { Light: ['Cinderella', 'cinderella'], Grey: ['Jane Eyre', 'jane-eyre'], Dark: ['Heathcliff', 'heathcliff'] },
    'Empath': { Light: ['Winnie the Pooh', 'winnie-the-pooh'], Grey: ['Quasimodo', 'quasimodo'], Dark: ["Frankenstein's Creature", 'frankensteins-creature'] },
    'Smutter': { Light: ['Juliet', 'juliet'], Grey: ['Mr. Darcy', 'mr-darcy'], Dark: ['Anna Karenina', 'anna-karenina'] },
    'Spectator': { Light: ['Elizabeth Bennet', 'elizabeth-bennet'], Grey: ['Cleopatra', 'cleopatra'], Dark: ['Macbeth', 'macbeth'] },
    'Nihilist': { Light: ['The Phantom of the Opera', 'phantom-of-the-opera'], Grey: ['Mr. Hyde', 'mr-hyde'], Dark: ['Dracula', 'dracula'] },
    'Adrenaline Junkie': { Light: ['Mowgli', 'mowgli'], Grey: ['Tarzan', 'tarzan'], Dark: ["D'Artagnan", 'dartagnan'] },
    "Hero's Son": { Light: ['Aladdin', 'aladdin'], Grey: ['Odysseus', 'odysseus'], Dark: ['Achilles', 'achilles'] },
    'Detective': { Light: ['Puss in Boots', 'puss-in-boots'], Grey: ['Sherlock Holmes', 'sherlock-holmes'], Dark: ['Moriarty', 'moriarty'] },
    'Adventurer': { Light: ['Alice', 'alice'], Grey: ['Icarus', 'icarus'], Dark: ['The Headless Horseman', 'headless-horseman'] },
    'Fiction Nerd': { Light: ['Athena', 'athena'], Grey: ['Merlin', 'merlin'], Dark: ['Circe', 'circe'] },
    'Pilgrim': { Light: ['Jean Valjean', 'jean-valjean'], Grey: ['Robin Hood', 'robin-hood'], Dark: ['Hercules', 'hercules'] },
    'Writer-Reader': { Light: ['Prospero', 'prospero'], Grey: ['Scheherazade', 'scheherazade'], Dark: ['Dorian Gray', 'dorian-gray'] },
    'Highbrow': { Light: ['Antigone', 'antigone'], Grey: ['Hamlet', 'hamlet'], Dark: ['Faust', 'faust'] }
  };

  // 1.7 Saved values for the new questions
  var GATE_1 = ['The love', 'The guilty pleasure', 'The story', 'The writing'];
  var GATE_1_SKIPS_GATE_2 = 'The writing';

  // 4.3 Gate table: gate_1 → gate_2 → provisional archetype ('*' = no gate_2)
  var GATE_TABLE = {
    'The love': { 'Falling in love': 'Cupid', 'Feeling at home': 'Empath' },
    'The guilty pleasure': { 'The heat': 'Smutter', 'The drama': 'Spectator', 'The dark': 'Nihilist' },
    'The story': {
      'The rush': 'Adrenaline Junkie', 'The hero': "Hero's Son", 'The twists and turns': 'Detective',
      'The adventure': 'Adventurer', 'The world': 'Fiction Nerd', 'The meaning': 'Pilgrim'
    },
    'The writing': { '*': 'Writer-Reader' }
  };

  // 4.4 Darkness slider: the position that matters for the Nihilist check.
  var UNFLINCHING = ['Unflinching', 'Hard'];
  var NIHILIST = 'Nihilist';
  var NIHILIST_FALLBACK = 'Adrenaline Junkie';
  var WRITER_READER = 'Writer-Reader';

  // 4.6 Highbrow override
  var HIGHBROW = 'Highbrow';
  var HIGHBROW_GRADE = 'A+';
  var HIGHBROW_GENRES = ['The Literary', 'Contemporary'];

  // 4.8 Genre defaults
  var GENRE_DEFAULTS = {
    'Fantasy': 'Adventurer', 'Science Fiction': 'Fiction Nerd', 'Romance': 'Cupid', 'Romantasy': 'Smutter',
    'Historical': 'Adventurer', 'Horror': 'Adrenaline Junkie', 'Mystery': 'Detective',
    'The Literary': 'Empath', 'Contemporary': 'Empath'
  };

  // Section 5: flavour shortlists. [main, allowed]. main null = open (all allowed).
  var A = {
    adv: 'Adventurer', hero: "Hero's Son", nerd: 'Fiction Nerd', pil: 'Pilgrim', emp: 'Empath', spec: 'Spectator',
    nih: 'Nihilist', cup: 'Cupid', aj: 'Adrenaline Junkie', det: 'Detective', smut: 'Smutter', wr: 'Writer-Reader'
  };
  function list(keys) { return keys.split(' ').map(function (k) { return A[k]; }); }
  var OPEN = null;

  var LITERARY_SHORTLIST = {
    'Family Secrets & Legacy': [A.spec, list('wr emp spec pil det')],
    'When It Falls To You': [A.emp, list('wr emp spec pil')],
    'Breaking the Pattern': [A.pil, list('wr emp spec pil hero')],
    'The Slow Unravelling': [A.spec, list('wr emp spec')],
    'Modern Love': [A.spec, list('wr emp spec cup')],
    'Deep Friendships': [A.emp, list('wr emp spec')],
    'Caught Between Worlds': [A.pil, list('wr emp spec pil')],
    'Sex, Gender & Desire': [A.emp, list('wr emp spec pil cup')],
    'Reinvention': [A.pil, list('wr emp spec pil adv hero cup')],
    'Grief & Loss': [A.emp, list('wr emp spec pil')],
    'Old Wounds': [A.emp, list('wr emp spec nih')],
    'The Quiet Crisis': [A.emp, list('wr emp spec nih')],
    'Modern Survival': [A.emp, list('wr emp spec pil')],
    'Digital Loneliness': [A.pil, list('wr emp spec pil nih')],
    'An Unequal World': [A.pil, list('wr emp spec pil')],
    'A World in Crisis': [A.pil, list('wr emp spec pil nih adv')]
  };

  var SHORTLISTS = {
    'Fantasy': {
      'Epic Quests': [A.adv, list('adv hero nerd pil emp spec nih cup aj')],
      'Wartime Epics': [A.hero, list('adv hero nerd pil spec nih cup aj')],
      'Blazing Trials': [A.hero, list('adv hero nerd emp spec nih smut cup aj')],
      'Dark Labyrinths': [A.spec, list('adv hero nerd pil spec nih cup aj det')],
      'Lone Wolves': [A.hero, list('adv hero nerd pil emp nih cup aj')],
      'Whispers & Wonder': [A.adv, list('adv nerd pil emp nih smut cup')],
      'Hidden Realms': [A.adv, list('adv hero nerd pil emp nih smut cup aj')],
      'Urban Frontlines': [A.adv, list('adv hero nerd emp spec nih smut cup aj')],
      'Sacred Myths': [A.pil, list('adv hero nerd pil emp spec nih cup')],
      'Clever Sparks': [A.adv, list('adv hero nerd emp spec smut cup aj det')],
      'Dark Academia': [A.spec, list('spec wr nih det smut cup aj')],
      'Cozy Realms': [A.emp, list('emp adv smut hero cup')],
      'Weird': [OPEN, null]
    },
    'Science Fiction': {
      'Space Opera': [A.adv, list('adv hero nerd pil emp spec nih aj smut cup')],
      'Cyber': [A.nerd, list('adv hero nerd pil spec nih aj det')],
      'Science-Heavy': [A.nerd, list('adv hero nerd pil nih aj det')],
      'Afterworld': [A.nih, list('adv hero nerd pil emp nih aj wr')],
      'First Contact': [A.nerd, list('adv nerd pil emp nih aj')],
      'The Strange': [OPEN, null]
    },
    'Romantasy': {
      'Enemies to Lovers': [A.smut, list('cup smut emp spec nih adv hero')],
      'Dark Obsession': [A.smut, list('smut nih spec')],
      'Power Play': [A.smut, list('cup smut spec nih hero')],
      'Forbidden Love': [A.cup, list('cup smut emp spec adv hero')],
      'Star-Crossed': [A.emp, list('cup smut emp spec nih adv')],
      'Political Intrigue': [A.spec, list('cup smut spec nih hero')],
      'Fated Bonds': [A.cup, list('cup smut emp adv hero')],
      'Slow Burn': [A.cup, list('cup smut emp adv hero')],
      'Protector & Protected': [A.emp, list('cup smut emp adv hero')],
      'Healing Love': [A.emp, list('cup smut emp adv hero')]
    },
    'Romance': {
      'Enemies to Lovers': [A.cup, list('cup emp smut spec wr')],
      'Dark Obsession': [A.smut, list('emp smut spec wr nih')],
      'Power Play': [A.smut, list('cup emp smut spec')],
      'Forbidden Love': [A.cup, list('cup emp smut spec wr')],
      'Star-Crossed': [A.emp, list('cup emp smut spec wr pil')],
      'Fake Relationship': [A.cup, list('cup emp smut spec')],
      'Friends to Lovers': [A.cup, list('cup emp smut spec wr')],
      'Slow Burn': [A.cup, list('cup emp smut spec wr')],
      'Second Chance': [A.cup, list('cup emp smut spec wr')],
      'Protector & Protected': [A.emp, list('cup emp smut spec wr')],
      'Healing Love': [A.emp, list('cup emp smut spec wr')]
    },
    'Horror': {
      'Psychological': [A.nih, list('nih hero det spec aj')],
      'Supernatural': [A.nih, list('nih hero det spec aj pil')],
      'Cosmic': [A.nih, list('nih hero det spec aj pil')],
      'Body': [A.nih, list('nih hero det spec aj')],
      'Folk': [A.nih, list('nih hero det spec aj pil')],
      'Predator': [A.nih, list('nih hero det spec aj')]
    },
    'Mystery': {
      'Cozy': [A.det, list('det spec hero emp cup')],
      'Who?!': [A.det, list('det spec nih hero aj')],
      'Noir': [A.det, list('det spec nih hero aj wr')],
      'Evidence': [A.det, list('det spec nih hero aj nerd')],
      'Psychological': [A.spec, list('det spec nih hero aj')],
      'Action': [A.aj, list('det spec nih hero aj adv')]
    },
    'The Literary': LITERARY_SHORTLIST,
    'Contemporary': LITERARY_SHORTLIST
  };
  // 5.8 Historical: every era is open.
  var OPEN_GENRES = ['Historical'];

  // Section 6: book swipe decks, shown 01 to 12. [title, author, hook]
  var SWIPE_DECKS = {
    'Adventurer': [
      ['The Way of Kings', 'Brandon Sanderson', 'On a storm-scoured world, a slave, a scholar and a highprince carry its fate.'],
      ['The Priory of the Orange Tree', 'Samantha Shannon', 'A heirless queen, a secret mage, and an ancient dragon waking beneath the world.'],
      ['A Court of Mist and Fury', 'Sarah J. Maas', 'She saved the faerie lands. Now she must survive what saving them cost her.'],
      ['A Darker Shade of Magic', 'V.E. Schwab', 'Four Londons, a magician who walks between them, and a thief who follows.'],
      ['Fourth Wing', 'Rebecca Yarros', 'At a war college for dragon riders, you graduate or you die.'],
      ['The Night Circus', 'Erin Morgenstern', "A circus that opens only at night, built as the stage for a magicians' duel."],
      ['The Bear and the Nightingale', 'Katherine Arden', 'In the frozen Russian wilderness, one girl can see the spirits everyone else forgets.'],
      ['Piranesi', 'Susanna Clarke', 'A man lives alone in an endless house of statues, tides and halls.'],
      ['The City of Brass', 'S.A. Chakraborty', 'A Cairo con artist summons a djinn, and a hidden city of magic awaits.'],
      ['Project Hail Mary', 'Andy Weir', 'An astronaut wakes in deep space with no memory and one shot to save Earth.'],
      ['The Long Way to a Small, Angry Planet', 'Becky Chambers', 'A misfit spaceship crew, a long-haul job, and a galaxy full of found family.'],
      ['The Hobbit', 'J.R.R. Tolkien', 'A comfortable homebody, a band of dwarves, and a dragon guarding a mountain of gold.']
    ],
    'Fiction Nerd': [
      ['Mistborn: The Final Empire', 'Brandon Sanderson', 'Swallow metals, burn them for power, and overthrow an immortal emperor.'],
      ['The Eye of the World', 'Robert Jordan', 'A quiet village, a night of monsters, and three friends tied to an ancient prophecy.'],
      ['Gardens of the Moon', 'Steven Erikson', "An empire at war, gods meddling in mortal battles, and a city that won't fall."],
      ['The Silmarillion', 'J.R.R. Tolkien', 'The creation of Middle-earth: gods, elves, stolen jewels, and the first great darkness.'],
      ['The Fifth Season', 'N.K. Jemisin', 'On a continent wracked by apocalyptic quakes, some people can command the earth itself.'],
      ['Babel', 'R.F. Kuang', "At Oxford's translation institute, the gaps between words power an empire."],
      ['Dune', 'Frank Herbert', 'Whoever controls the spice controls the universe. One desert planet holds it all.'],
      ['The Three-Body Problem', 'Liu Cixin', 'A secret military project, a strange video game, and physics that stops making sense.'],
      ['The Martian', 'Andy Weir', 'Stranded on Mars, one botanist must science his way out of certain death.'],
      ['Anathem', 'Neal Stephenson', 'Scholars sealed inside a monastery for centuries are called out to face the sky.'],
      ['Leviathan Wakes', 'James S.A. Corey', "An ice hauler's crew finds a derelict ship, and a conspiracy that could end humanity."],
      ['Master and Commander', "Patrick O'Brian", 'A Royal Navy captain, his surgeon friend, and the Napoleonic seas in perfect detail.']
    ],
    "Hero's Son": [
      ['Red Rising', 'Pierce Brown', 'A miner from the lowest caste infiltrates the ruling elite to tear them down.'],
      ['The Way of Kings', 'Brandon Sanderson', 'A branded slave, forced to run bridges into battle, refuses to let his men die.'],
      ['The Count of Monte Cristo', 'Alexandre Dumas', 'Betrayed and imprisoned for years, a sailor returns as a count with a plan.'],
      ['The Hunger Games', 'Suzanne Collins', 'She volunteers to save her sister. Now she must survive the arena.'],
      ['Fourth Wing', 'Rebecca Yarros', 'Everyone expects her to die at dragon-rider college. She has other plans.'],
      ['Throne of Glass', 'Sarah J. Maas', "Freed from a prison mine, an assassin fights for her freedom in the king's contest."],
      ['The Rage of Dragons', 'Evan Winter', 'A lowborn soldier trains relentlessly for one goal: vengeance against the highborn.'],
      ['Unsouled', 'Will Wight', 'Born without power in a world that worships it, he refuses to stay weak.'],
      ['The Last Kingdom', 'Bernard Cornwell', 'A Saxon boy raised by Danes fights to reclaim the fortress stolen from him.'],
      ['Storm Front', 'Jim Butcher', "Chicago's only professional wizard: broke, outgunned, and still the one who shows up."],
      ['Killing Floor', 'Lee Child', 'A drifter steps off a bus in a small town and is arrested for murder.'],
      ['The Lightning Thief', 'Rick Riordan', "A troubled kid learns his father is a Greek god, and he's been framed."]
    ],
    'Detective': [
      ['And Then There Were None', 'Agatha Christie', 'Ten strangers invited to an island. One by one, someone starts killing them.'],
      ['The Hound of the Baskervilles', 'Arthur Conan Doyle', 'A family curse, a moor at night, and a spectral hound only Holmes can explain.'],
      ['Magpie Murders', 'Anthony Horowitz', "An editor reads a crime novel's final manuscript, and finds the last chapter missing."],
      ['The 7½ Deaths of Evelyn Hardcastle', 'Stuart Turton', 'Evelyn dies every night. Relive the day in eight bodies until you solve it.'],
      ['The Appeal', 'Janice Hallett', 'A murder told entirely through emails and texts. The clues are all there.'],
      ['The Devotion of Suspect X', 'Keigo Higashino', 'A maths genius builds a perfect alibi. A physicist sets out to break it.'],
      ['The Thursday Murder Club', 'Richard Osman', 'Four pensioners who solve cold cases for fun face a real murder on their doorstep.'],
      ["A Good Girl's Guide to Murder", 'Holly Jackson', 'Everyone says he killed her. For her school project, Pip sets out to prove otherwise.'],
      ['The Girl with the Dragon Tattoo', 'Stieg Larsson', 'A disgraced journalist and a brilliant hacker dig into a forty-year-old disappearance.'],
      ['The Name of the Rose', 'Umberto Eco', 'Monks are dying in a medieval abbey, and its library holds the answer.'],
      ['Rivers of London', 'Ben Aaronovitch', 'A rookie London cop interviews a ghost witness, and gets recruited as a wizard.'],
      ['Tinker Tailor Soldier Spy', 'John le Carré', "There's a Soviet mole at the top of British intelligence. Smiley must find him."]
    ],
    'Pilgrim': [
      ['The Alchemist', 'Paulo Coelho', 'A shepherd boy dreams of treasure and crosses the desert to find it.'],
      ['Siddhartha', 'Hermann Hesse', 'A young seeker abandons every comfort and teaching to find enlightenment his own way.'],
      ['Les Misérables', 'Victor Hugo', 'A convict shown one act of mercy spends his life trying to deserve it.'],
      ['East of Eden', 'John Steinbeck', 'Two families, three generations, and the oldest story of brothers retold in California.'],
      ['A Wizard of Earthsea', 'Ursula K. Le Guin', 'A gifted young wizard unleashes a shadow, and must hunt it across the sea.'],
      ['The Midnight Library', 'Matt Haig', 'Between life and death, a library holds every life she could have lived.'],
      ['The Kite Runner', 'Khaled Hosseini', 'A man returns to Afghanistan to atone for a childhood betrayal.'],
      ['Life of Pi', 'Yann Martel', 'A boy, a tiger, a lifeboat, and a story that will make you believe.'],
      ['The Book Thief', 'Markus Zusak', 'In Nazi Germany, a girl steals books, and Death tells her story.'],
      ['Circe', 'Madeline Miller', 'Banished by the gods, a witch on an island discovers her own power.'],
      ['The Invisible Life of Addie LaRue', 'V.E. Schwab', 'She trades her soul to live forever, but no one can ever remember her.'],
      ['Station Eleven', 'Emily St. John Mandel', 'After the collapse, a travelling troupe performs Shakespeare, because survival is insufficient.']
    ],
    'Empath': [
      ['Legends & Lattes', 'Travis Baldree', "An orc mercenary hangs up her sword to open the city's first coffee shop."],
      ['The House in the Cerulean Sea', 'TJ Klune', 'A lonely caseworker inspects an island orphanage of magical children, and finds a home.'],
      ['A Man Called Ove', 'Fredrik Backman', 'The grumpiest man on the street keeps being interrupted by neighbours who need him.'],
      ['Remarkably Bright Creatures', 'Shelby Van Pelt', 'A grieving widow working nights at an aquarium befriends a very clever octopus.'],
      ['People We Meet on Vacation', 'Emily Henry', "Best friends, one summer trip a year, and the one they don't talk about."],
      ['Me Before You', 'Jojo Moyes', "A small-town carer and the man she's hired to look after change each other's lives."],
      ['The Nightingale', 'Kristin Hannah', 'Two sisters in occupied France fight to survive the war in very different ways.'],
      ["Emily Wilde's Encyclopaedia of Faeries", 'Heather Fawcett', 'A prickly scholar travels to a remote village to study faeries, and gets distracted.'],
      ['The Travelling Cat Chronicles', 'Hiro Arikawa', "A man and his cat road-trip across Japan, searching for the cat's new home."],
      ['The Maid', 'Nita Prose', 'A hotel maid who sees the world differently finds a guest dead in his bed.'],
      ['Little Women', 'Louisa May Alcott', 'Four sisters growing up, falling in love, and holding each other together.'],
      ['Anne of Green Gables', 'L.M. Montgomery', 'A talkative orphan arrives at a farm that wanted a boy, and wins everyone over.']
    ],
    'Smutter': [
      ['A Court of Thorns and Roses', 'Sarah J. Maas', 'A huntress kills a wolf in the woods, and a faerie lord comes to collect.'],
      ['From Blood and Ash', 'Jennifer L. Armentrout', 'A sheltered Maiden, forbidden from being touched, meets the guard who tempts her.'],
      ['The Serpent and the Wings of Night', 'Carissa Broadbent', 'A human raised by vampires enters a deadly tournament, and must ally with a rival.'],
      ['Quicksilver', 'Callie Hart', 'A metal-bending thief is dragged into the fae realm by a brutal warrior.'],
      ['Haunting Adeline', 'H.D. Carlton', "A writer in an inherited manor gains a stalker, and doesn't want him gone."],
      ['Twisted Love', 'Ana Huang', "He's her brother's cold, ruthless best friend, and he'd burn the world for her."],
      ['Icebreaker', 'Hannah Grace', 'A figure skater and a hockey captain are forced to share the same ice.'],
      ['The Duke and I', 'Julia Quinn', 'A fake courtship between a debutante and a duke becomes very, very real.'],
      ['The Cruel Prince', 'Holly Black', 'A mortal girl in the faerie court, and a cruel prince who hates her.'],
      ['Divine Rivals', 'Rebecca Ross', 'Rival journalists in a world at war, and letters to a stranger who understands her.'],
      ['The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', 'A reclusive Hollywood icon finally tells the truth about her seven marriages.'],
      ['Big Little Lies', 'Liane Moriarty', 'Three mothers, one school trivia night, and a death nobody saw coming.']
    ],
    'Spectator': [
      ['Gone Girl', 'Gillian Flynn', 'On their fifth anniversary, Amy vanishes, and everyone starts looking at her husband.'],
      ['The Housemaid', 'Freida McFadden', "A woman with a past takes a live-in job with a family that's hiding everything."],
      ['Big Little Lies', 'Liane Moriarty', 'Perfect beachside mothers, a school feud, and a trivia night that ends in death.'],
      ['The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', 'Seven marriages, one legendary actress, and the scandal she kept hidden for decades.'],
      ['The Talented Mr. Ripley', 'Patricia Highsmith', 'Sent to bring a rich heir home from Italy, Tom Ripley wants his life instead.'],
      ['The Secret History', 'Donna Tartt', 'Elite classics students, a charismatic professor, and a murder they all helped commit.'],
      ['The Guest List', 'Lucy Foley', 'A celebrity wedding on a remote island. Every guest has a grudge. Someone dies.'],
      ['Little Fires Everywhere', 'Celeste Ng', 'In a perfect planned suburb, a mysterious artist and her daughter set everything alight.'],
      ['Yellowface', 'R.F. Kuang', 'When her famous rival dies, a struggling author steals her manuscript and her fame.'],
      ['The Cruel Prince', 'Holly Black', 'A mortal girl in a cruel faerie court decides to play their game of power.'],
      ['The Other Boleyn Girl', 'Philippa Gregory', 'Two sisters, one king, and a Tudor court where ambition can cost your head.'],
      ['Rebecca', 'Daphne du Maurier', "A new bride arrives at Manderley, where her husband's first wife still rules every room."]
    ],
    'Nihilist': [
      ['Blood Meridian', 'Cormac McCarthy', 'A teenage runaway joins a gang of scalp hunters on the 1840s Mexican border.'],
      ['American Psycho', 'Bret Easton Ellis', 'A Wall Street banker obsessed with perfect business cards hides a monstrous secret.'],
      ['A Little Life', 'Hanya Yanagihara', 'Four friends in New York, and one whose past will not let him go.'],
      ['Fight Club', 'Chuck Palahniuk', 'An insomniac office worker meets a man who teaches him to destroy everything.'],
      ['The Shining', 'Stephen King', 'A writer takes a winter caretaker job at an isolated hotel with his family.'],
      ['The Haunting of Hill House', 'Shirley Jackson', 'Four people move into a house with a terrible reputation to study what lives there.'],
      ['Mexican Gothic', 'Silvia Moreno-Garcia', "A socialite visits her cousin's crumbling mansion in the mountains, and something is very wrong."],
      ['Tender Is the Flesh', 'Agustina Bazterrica', 'Animal meat is gone. Society has found a replacement, and made it legal.'],
      ['The Only Good Indians', 'Stephen Graham Jones', 'Ten years after a hunt gone wrong, something comes back for four friends.'],
      ['Annihilation', 'Jeff VanderMeer', 'Four women enter Area X. Eleven expeditions before them went wrong.'],
      ['The Blade Itself', 'Joe Abercrombie', 'A torturer, a barbarian and a vain nobleman, caught in a war without heroes.'],
      ['1984', 'George Orwell', 'Big Brother is watching, and one man dares to think for himself.']
    ],
    'Highbrow': [
      ["The Handmaid's Tale", 'Margaret Atwood', "In a regime that controls women's bodies, one handmaid remembers her life before."],
      ['Never Let Me Go', 'Kazuo Ishiguro', 'Three friends grow up at an idyllic English boarding school that hides a purpose.'],
      ['Normal People', 'Sally Rooney', 'Two teenagers from different worlds circle each other for years, never quite letting go.'],
      ['Americanah', 'Chimamanda Ngozi Adichie', 'A young Nigerian woman moves to America and discovers what it means to be Black.'],
      ['My Year of Rest and Relaxation', 'Ottessa Moshfegh', 'A young woman with everything decides to sleep for an entire year.'],
      ['Cloud Atlas', 'David Mitchell', 'Six lives across centuries, nested inside each other like Russian dolls.'],
      ['Brave New World', 'Aldous Huxley', 'A perfectly happy world, engineered from birth. Is it really paradise?'],
      ['The Stranger', 'Albert Camus', "A man shows no grief at his mother's funeral, and the world can't forgive him."],
      ['Crime and Punishment', 'Fyodor Dostoevsky', 'A broke student convinces himself that one murder could be justified.'],
      ['Things Fall Apart', 'Chinua Achebe', 'A proud village leader watches his world unravel as colonisers arrive.'],
      ["If on a winter's night a traveler", 'Italo Calvino', 'You are about to begin reading a novel. It keeps getting interrupted.'],
      ['Ulysses', 'James Joyce', 'One ordinary day in Dublin, told as an epic. The ultimate literary challenge.']
    ],
    'Writer-Reader': [
      ['The Great Gatsby', 'F. Scott Fitzgerald', 'A mysterious millionaire throws lavish parties for one woman across the bay.'],
      ['Pride and Prejudice', 'Jane Austen', 'A sharp-tongued young woman and a proud gentleman misjudge each other completely.'],
      ['Jane Eyre', 'Charlotte Brontë', 'An orphaned governess falls for her brooding employer, at a house full of secrets.'],
      ['Mrs Dalloway', 'Virginia Woolf', 'One June day in London, inside the mind of a woman preparing a party.'],
      ['One Hundred Years of Solitude', 'Gabriel García Márquez', 'Seven generations of one family in a town where magic is ordinary.'],
      ['Beloved', 'Toni Morrison', 'A woman who escaped slavery is haunted by the past, in her house and herself.'],
      ['The Big Sleep', 'Raymond Chandler', "A private detective, a rich general's wild daughters, and Los Angeles at its sleaziest."],
      ['The Song of Achilles', 'Madeline Miller', 'The love story of Achilles and Patroclus, told by the one history forgot.'],
      ["On Earth We're Briefly Gorgeous", 'Ocean Vuong', 'A son writes a letter to his mother, who cannot read it.'],
      ['Small Things Like These', 'Claire Keegan', 'In a small Irish town at Christmas, a coal merchant discovers what everyone ignores.'],
      ['Wolf Hall', 'Hilary Mantel', "A blacksmith's son rises to become the most powerful man in Henry VIII's court."],
      ['The Road', 'Cormac McCarthy', 'A father and son walk through a burned America, carrying the fire.']
    ],
    'Adrenaline Junkie': [
      ['Six of Crows', 'Leigh Bardugo', 'Six outcasts. One impossible heist. A fortress no one has ever broken into.'],
      ['Red Queen', 'Victoria Aveyard', 'A common girl discovers a forbidden power, right in front of the royal court.'],
      ['A Game of Thrones', 'George R.R. Martin', 'Noble families scheme for the Iron Throne while something ancient stirs beyond the Wall.'],
      ['Red Rising', 'Pierce Brown', 'A miner from the lowest caste infiltrates the ruling elite to tear them down.'],
      ['Dark Matter', 'Blake Crouch', "A physicist is abducted and wakes in a life that isn't his."],
      ['The Da Vinci Code', 'Dan Brown', 'A murder in the Louvre leaves a code hiding a two-thousand-year-old secret.'],
      ['The Bourne Identity', 'Robert Ludlum', 'A man pulled from the sea with bullet wounds and no memory is being hunted.'],
      ['The Silence of the Lambs', 'Thomas Harris', 'To catch a killer, a young FBI trainee must consult a far more dangerous one.'],
      ['The Girl on the Train', 'Paula Hawkins', 'Every day, she watches a perfect couple from her train window. Then she sees something.'],
      ['The Silent Patient', 'Alex Michaelides', 'A famous painter shoots her husband, then never speaks another word.'],
      ['Never Lie', 'Freida McFadden', "Snowed in at a missing psychiatrist's house, a couple finds her hidden session tapes."],
      ['Bird Box', 'Josh Malerman', 'Something outside drives people to madness if they see it. Keep your eyes closed.']
    ],
    'Cupid': [
      ['A Court of Thorns and Roses', 'Sarah J. Maas', 'Dragged into a faerie realm, a mortal huntress finds love where she least expected.'],
      ['Fourth Wing', 'Rebecca Yarros', "At a deadly dragon-rider college, her worst enemy might be the one she can't resist."],
      ['Twilight', 'Stephenie Meyer', "In a rainy town, a new girl falls for a boy who isn't quite human."],
      ['Pride and Prejudice', 'Jane Austen', 'First impressions are terrible. Second ones are worse. Then everything changes.'],
      ['The Duke and I', 'Julia Quinn', 'A fake courtship between a debutante and a duke becomes very, very real.'],
      ['Outlander', 'Diana Gabaldon', 'A WWII nurse touches a standing stone and wakes in 1743 Scotland.'],
      ['Normal People', 'Sally Rooney', 'Two teenagers from different worlds circle each other for years, never quite letting go.'],
      ['Beach Read', 'Emily Henry', 'Two rival writers swap genres for a summer, and their rules start slipping.'],
      ['Red, White & Royal Blue', 'Casey McQuiston', "The US President's son and a British prince fake a friendship. It doesn't stay fake."],
      ['The Song of Achilles', 'Madeline Miller', 'An exiled prince falls for the greatest of the Greeks, all the way to Troy.'],
      ['The Notebook', 'Nicholas Sparks', "An old man reads a love story every day to a woman who's forgotten it."],
      ['This Is How You Lose the Time War', 'Amal El-Mohtar & Max Gladstone', 'Two rival agents fighting a war across time start leaving each other letters.']
    ]
  };

  // ══════════════════════════════════════════════════════════════════════════
  // FUNCTIONS (read only from the tables above)
  // ══════════════════════════════════════════════════════════════════════════

  function normaliseGenre(genre) {
    return GENRE_ALIASES[genre] || genre;
  }

  // Section 2
  function olympicsTotal(answers) {
    var total = 0;
    ['olympics_q1', 'olympics_q2', 'olympics_q3', 'olympics_q4'].forEach(function (key) {
      var points = OLYMPICS_POINTS.q1_to_q4[answers[key]];
      if (points === undefined) throw new Error(key + ' must be one of: ' + Object.keys(OLYMPICS_POINTS.q1_to_q4).join(', '));
      total += points;
    });
    var q5 = OLYMPICS_POINTS.q5[answers.olympics_q5];
    if (q5 === undefined) throw new Error('olympics_q5 must be one of: ' + Object.keys(OLYMPICS_POINTS.q5).join(', '));
    return total + q5;
  }

  function gradeFor(total) {
    for (var i = 0; i < GRADE_BANDS.length; i++) {
      if (total >= GRADE_BANDS[i].min && total <= GRADE_BANDS[i].max) return GRADE_BANDS[i].grade;
    }
    throw new Error('olympics_total out of range: ' + total);
  }

  // Section 3
  function masksTotal(answers) {
    return ['masks_silver', 'masks_gold', 'masks_black'].reduce(function (sum, key) {
      var value = Number(answers[key]);
      if (!(value >= 1 && value <= 3)) throw new Error(key + ' must be 1, 2 or 3');
      return sum + value;
    }, 0);
  }

  function isUnflinching(slider) { return UNFLINCHING.indexOf(slider) !== -1; }

  // Section 5 lookup by genre + flavour. Returns { open, main, allowed, missing }.
  function shortlistFor(genre, flavour) {
    if (OPEN_GENRES.indexOf(genre) !== -1) return { open: true, main: null, allowed: null, missing: false };
    var row = SHORTLISTS[genre] && SHORTLISTS[genre][flavour];
    if (!row) return { open: true, main: null, allowed: null, missing: true };
    return { open: row[0] === OPEN, main: row[0], allowed: row[1], missing: false };
  }

  // 4.3
  function provisionalArchetype(gate1, gate2) {
    var row = GATE_TABLE[gate1];
    if (!row) throw new Error('gate_1 must be one of: ' + GATE_1.join(', '));
    var archetype = row['*'] || row[gate2];
    if (!archetype) throw new Error('gate_2 "' + gate2 + '" does not match gate_1 "' + gate1 + '"');
    return archetype;
  }

  /*
   * Run Section 4 in order. Input (saved answers):
   *   genre_calling, genre_flavour, gate_1, gate_2, darkness (slider value),
   *   olympics_q1..q5, masks_silver, masks_gold, masks_black
   * Returns every calculated field from 7.2, plus the result image files.
   */
  function calculate(answers) {
    var genre = normaliseGenre(answers.genre_calling);
    if (GENRES.indexOf(genre) === -1) throw new Error('Unknown genre_calling: ' + answers.genre_calling);
    var flavour = answers.genre_flavour;
    var unflinching = isUnflinching(answers.darkness);
    var shortlist = shortlistFor(genre, flavour);
    var flavourMain = shortlist.open ? GENRE_DEFAULTS[genre] : shortlist.main;

    // Step 1: Literary Grade
    var total = olympicsTotal(answers);
    var grade = gradeFor(total);

    // Step 2: Moral Score
    var masks = masksTotal(answers);
    var moral = MORAL_TIERS[masks];

    // Step 3: provisional archetype
    var provisional = provisionalArchetype(answers.gate_1, answers.gate_2);

    // Step 4: validation checks
    var archetype = provisional;
    if (archetype === WRITER_READER && WRITER_READER_GRADES.indexOf(grade) === -1) archetype = flavourMain;
    if (archetype === NIHILIST && !unflinching) archetype = NIHILIST_FALLBACK;
    var validationChanged = archetype !== provisional;

    // Step 5: flavour shortlist check
    var fallbackUsed = false;
    if (!shortlist.open && shortlist.allowed.indexOf(archetype) === -1) {
      fallbackUsed = true;
      archetype = shortlist.main;
      if (archetype === NIHILIST && !unflinching && shortlist.allowed.indexOf(NIHILIST_FALLBACK) !== -1) archetype = NIHILIST_FALLBACK;
    }

    // Step 6: Highbrow override
    var highbrow = grade === HIGHBROW_GRADE && HIGHBROW_GENRES.indexOf(genre) !== -1 && answers.gate_1 !== GATE_1_SKIPS_GATE_2;
    if (highbrow) archetype = HIGHBROW;

    // Step 7: House, SoulCharacter, files
    var info = ARCHETYPES[archetype];
    var character = SOUL_CHARACTERS[archetype][moral.band];
    return {
      genre_calling: genre,
      olympics_total: total,
      literary_grade: grade,
      literary_grade_name: GRADES[grade].name,
      masks_total: masks,
      moral_tier: moral.tier,
      moral_band: moral.band,
      provisional_archetype: provisional,
      validation_changed: validationChanged ? 'yes' : 'no',
      fallback_used: fallbackUsed ? 'yes' : 'no',
      highbrow_override: highbrow ? 'yes' : 'no',
      final_archetype: archetype,
      house: info.house,
      soul_character: character[0],
      flavour_missing: shortlist.missing,
      files: {
        character: 'character_' + character[1] + '.png',
        archetype: 'archetype_' + info.slug + '.png',
        grade: 'grade_' + GRADES[grade].slug + '.png',
        moral: 'moral_' + moral.slug + '.png',
        house: HOUSES[info.house].image,
        emblem: HOUSES[info.house].emblem
      },
      house_colour: HOUSES[info.house].colour
    };
  }

  // Section 6: the 12 books for an archetype, with image file names.
  function swipeDeck(archetype) {
    var deck = SWIPE_DECKS[archetype];
    if (!deck) throw new Error('No swipe deck for archetype: ' + archetype);
    var slug = ARCHETYPES[archetype].slug;
    return deck.map(function (book, i) {
      var number = (i < 9 ? '0' : '') + (i + 1);
      return { number: number, title: book[0], author: book[1], hook: book[2], image: 'book_' + slug + '_' + number + '.jpg' };
    });
  }

  // 7.2 swipe_01 … swipe_12 value: "[Title] | [Answer]"
  function swipeValue(book, answer) { return book.title + ' | ' + answer; }

  return {
    // tables
    GENRES: GENRES, GENRE_ALIASES: GENRE_ALIASES, ARCHETYPES: ARCHETYPES, HOUSES: HOUSES, GRADES: GRADES,
    OLYMPICS_POINTS: OLYMPICS_POINTS, GRADE_BANDS: GRADE_BANDS, MORAL_TIERS: MORAL_TIERS,
    SOUL_CHARACTERS: SOUL_CHARACTERS, GATE_1: GATE_1, GATE_TABLE: GATE_TABLE, GENRE_DEFAULTS: GENRE_DEFAULTS,
    SHORTLISTS: SHORTLISTS, OPEN_GENRES: OPEN_GENRES, SWIPE_DECKS: SWIPE_DECKS,
    // functions
    normaliseGenre: normaliseGenre, olympicsTotal: olympicsTotal, gradeFor: gradeFor, masksTotal: masksTotal,
    shortlistFor: shortlistFor, provisionalArchetype: provisionalArchetype, calculate: calculate,
    swipeDeck: swipeDeck, swipeValue: swipeValue
  };
});

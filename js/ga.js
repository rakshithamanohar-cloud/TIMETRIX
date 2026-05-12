// ════════════════════════════════════════════════════════════
// TIMETRIX — GENETIC ALGORITHM ENGINE v5
// BMS College for Women, Bengaluru — BCA Department
//
// FIXES FROM REAL BMS TIMETABLE PDF (v5):
// 1. periodsPerWeek matches exact BMS counts per subject
// 2. slot 0 (8-9am) on weekdays = lab blocks only, no theory
// 3. slot 8 (4-5pm) = blocked from theory placement
// 4. III BCA ML/MAD labs only on Tue/Wed/Fri (never Mon/Thu)
// 5. Saturday lab = only sections needing 3rd block there
// 6. Language periodsPerWeek = 5 (Mon-Fri, one per day)
// 7. MERN Stack = Saturday only, 1 period
// 8. Library (LIB) = Wednesday slot 2 only, I BCA only
// 9. IKS = 1 period/week only
// 10. EVS = 3 periods/week
// 11. Faculty clash fix: skip 'tbd'/'default' IDs
// 12. Fitness divisor = 15000 so 0-conflict = 100%
// 13. Saturday: max 2 theory slots, no afternoon
// 14. 3 lab pairs placed per year (9hrs/week labs)
// ════════════════════════════════════════════════════════════

const GA = {

  CLASSES:   ['I_A','I_B','II_A','II_B','II_C','II_D','III_A','III_B','III_C'],
  YEAR1_CLS: ['I_A','I_B'],
  YEAR2_CLS: ['II_A','II_B','II_C','II_D'],
  YEAR3_CLS: ['III_A','III_B','III_C'],
  DAYS:      ['Mon','Tue','Wed','Thu','Fri','Sat'],
  WEEKDAYS:  ['Mon','Tue','Wed','Thu','Fri'],

  // slot 4 = LUNCH (skipped), slot indices match SLOT_LABELS below
  WORK_SLOTS: [0,1,2,3,5,6,7,8],
  SAT_SLOTS:  [0,1,2,3],

  // Valid 3-hour lab block slot combinations
  LAB_BLOCKS_WEEK: [[0,1,2],[1,2,3],[5,6,7],[6,7,8]],
  LAB_BLOCKS_SAT:  [[0,1,2]],

  SLOT_LABELS: [
    '8:00-9:00','9:00-10:00','10:00-11:00','11:00-12:00',
    'LUNCH',
    '1:00-2:00','2:00-3:00','3:00-4:00','4:00-5:00'
  ],

  // ── DEFAULT SUBJECTS ──────────────────────────────────────
  // periodsPerWeek = exact counts from BMS original timetable PDF
  DEFAULT_SUBJECTS: {
    1: [
      // Theory — counted slot by slot from BMS PDF
      { name:'Computer Architecture', isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:3 },
      { name:'OOP with Java',         isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:4 },
      { name:'Data Structures',       isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:4 },
      { name:'Operating Systems',     isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:4 },
      { name:'English',               isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:3 },
      { name:'EVS',                   isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:3 },
      { name:'Library',               isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:1, isLibrary:true },
      // Languages — 5 days Mon-Fri, one slot each day, all sections same slot
      { name:'Kannada',  isLab:false, isLang:true, isShared:false, lab_batch:null, language_code:'K', language_room:'209',  periodsPerWeek:5 },
      { name:'Hindi',    isLab:false, isLang:true, isShared:false, lab_batch:null, language_code:'H', language_room:'229',  periodsPerWeek:5 },
      { name:'Sanskrit', isLab:false, isLang:true, isShared:false, lab_batch:null, language_code:'S', language_room:'125',  periodsPerWeek:5 },
      // Labs — 3 pairs, each runs once per week as 3hr block
      // Pair 1: Java Lab B1 + DS Lab B2
      { name:'Java Lab', isLab:true, isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'L2', periodsPerWeek:3 },
      { name:'DS Lab',   isLab:true, isLang:false, isShared:false, lab_batch:'B2', language_code:null, lab_room_pref:'L3', periodsPerWeek:3 },
      // Pair 2: DS Lab B1 + OS Lab B2
      { name:'DS Lab B1', isLab:true, isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'L2', periodsPerWeek:3, pairKey:'pair2' },
      { name:'OS Lab B2', isLab:true, isLang:false, isShared:false, lab_batch:'B2', language_code:null, lab_room_pref:'L3', periodsPerWeek:3, pairKey:'pair2' },
      // Pair 3 (Saturday): OS Lab B1 + Java Lab B2
      { name:'OS Lab',      isLab:true, isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'EL', periodsPerWeek:3, saturdayLab:true },
      { name:'Java Lab B2', isLab:true, isLang:false, isShared:false, lab_batch:'B2', language_code:null, lab_room_pref:'L3', periodsPerWeek:3, saturdayLab:true },
    ],
    2: [
      // Theory
      { name:'Algorithm Design',  isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:4 },
      { name:'Artificial Intel',  isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:4 },
      { name:'Problem Solving',   isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:4 },
      { name:'English',           isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:3 },
      { name:'Indian Knowledge',  isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:1 },
      // Shared lecture — all II BCA sections same slot, different rooms
      { name:'Web Programming',   isLab:false, isLang:false, isShared:true, lab_batch:null, language_code:null, shared_rooms:'311,308,316,310B', periodsPerWeek:3 },
      // Languages
      { name:'Kannada',  isLab:false, isLang:true, isShared:false, lab_batch:null, language_code:'K', language_room:'314',  periodsPerWeek:5 },
      { name:'Hindi',    isLab:false, isLang:true, isShared:false, lab_batch:null, language_code:'H', language_room:'221A', periodsPerWeek:5 },
      { name:'Sanskrit', isLab:false, isLang:true, isShared:false, lab_batch:null, language_code:'S', language_room:'125',  periodsPerWeek:5 },
      // Labs — 3 pairs
      // Pair 1: AI Lab B1 + PS Lab B2
      { name:'AI Lab',  isLab:true, isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'L2', periodsPerWeek:3 },
      { name:'PS Lab',  isLab:true, isLang:false, isShared:false, lab_batch:'B2', language_code:null, lab_room_pref:'L3', periodsPerWeek:3 },
      // Pair 2: PS Lab B1 + ADA Lab B2
      { name:'PS Lab B1',  isLab:true, isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'L1', periodsPerWeek:3, pairKey:'pair2' },
      { name:'ADA Lab B2', isLab:true, isLang:false, isShared:false, lab_batch:'B2', language_code:null, lab_room_pref:'L4', periodsPerWeek:3, pairKey:'pair2' },
      // Pair 3 (Saturday or Fri): ADA Lab B1 + AI Lab B2
      { name:'ADA Lab',    isLab:true, isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'L2', periodsPerWeek:3, saturdayLab:true },
      { name:'AI Lab B2',  isLab:true, isLang:false, isShared:false, lab_batch:'B2', language_code:null, lab_room_pref:'L2', periodsPerWeek:3, saturdayLab:true },
    ],
    3: [
      // Theory
      { name:'Machine Learning', isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:4 },
      { name:'Mobile App Dev',   isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:4 },
      { name:'Software Testing', isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:3 },
      { name:'ECD',              isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:3 },
      // MERN Stack — Saturday only, 1 slot
      { name:'MERN Stack',       isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null, periodsPerWeek:1, saturdayOnly:true },
      // Labs
      // Pair 1: ML Lab B1 + MAD Lab B2 — Tue/Wed/Fri ONLY (never Mon/Thu = Project Lab days)
      { name:'ML Lab',  isLab:true, isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'L4', periodsPerWeek:3 },
      { name:'MAD Lab', isLab:true, isLang:false, isShared:false, lab_batch:'B2', language_code:null, lab_room_pref:'L1', periodsPerWeek:3 },
      // Pair 2: MAD Lab B1 + ML Lab B2 — Tue/Wed/Fri ONLY
      { name:'MAD Lab B1', isLab:true, isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'L1', periodsPerWeek:3, pairKey:'pair2' },
      { name:'ML Lab B2',  isLab:true, isLang:false, isShared:false, lab_batch:'B2', language_code:null, lab_room_pref:'L4', periodsPerWeek:3, pairKey:'pair2' },
      // Project Lab — fixed Mon+Thu 8-11 for all III BCA
      { name:'Project Lab', isLab:true, isLang:false, isShared:false, lab_batch:'both', language_code:null, lab_room_pref:'L1', periodsPerWeek:6, isProject:true },
    ]
  },

  // ── HELPERS ───────────────────────────────────────────────
  getYear(cls) {
    if (cls.startsWith('III')) return 3;
    if (cls.startsWith('II_')) return 2;
    return 1;
  },
  getClassesForYear(y) {
    if (y === 1) return this.YEAR1_CLS;
    if (y === 2) return this.YEAR2_CLS;
    return this.YEAR3_CLS;
  },
  getSlots(day) { return day === 'Sat' ? this.SAT_SLOTS : this.WORK_SLOTS; },
  getLabBlocks(day) { return day === 'Sat' ? this.LAB_BLOCKS_SAT : this.LAB_BLOCKS_WEEK; },
  rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); },

  // ── BUILD SUBJECT POOL FROM DB ────────────────────────────
  buildSubjectPoolFromDB(allSubjects, faculty) {
    const pool = { 1:[], 2:[], 3:[] };
    const fMap = {};
    faculty.forEach(f => { fMap[f.id] = f; });

    allSubjects.forEach(sub => {
      const year = parseInt(sub.year);
      if (!year || year < 1 || year > 3) return;
      const f         = fMap[sub.faculty_id];
      const isLab     = sub.type === 'lab' || sub.type === 'project';
      const isLang    = sub.type === 'language';
      const isShared  = sub.is_shared === 'yes' || sub.is_shared === true || sub.is_shared === 1;
      const isProject = sub.type === 'project';

      const entry = {
        name:          sub.name,
        code:          sub.code || '',
        isLab, isLang, isShared, isProject,
        isLibrary:     sub.is_library === true || sub.is_library === 1 || false,
        saturdayOnly:  sub.saturday_only === true || sub.saturday_only === 1 || false,
        saturdayLab:   sub.saturday_lab === true || sub.saturday_lab === 1 || false,
        lab_batch:     sub.lab_batch    || (isLab ? 'B1' : null),
        lab_room_pref: sub.lab_room_pref || null,
        language_code: sub.language_code || null,
        language_room: sub.language_room || null,
        shared_rooms:  sub.shared_rooms  || null,
        facultyId:     sub.faculty_id    || null,
        facultyName:   f ? f.name : 'TBD',
        facultyCode:   f ? (f.code || f.name.split(' ').pop()) : 'TBD',
        periodsPerWeek: sub.periods_per_week ||
          (isProject ? 6 : isLab ? 3 : isLang ? 5 : isShared ? 3 : 4),
        room_type: sub.room_type || (isLab ? 'lab' : 'classroom'),
      };
      pool[year].push(entry);
    });

    // Fall back to defaults if DB empty for a year
    [1,2,3].forEach(y => {
      if (pool[y].length === 0) {
        pool[y] = this.DEFAULT_SUBJECTS[y].map(s => ({
          ...s,
          code:'', facultyId:null, facultyName:'TBD', facultyCode:'TBD',
          room_type: s.isLab ? 'lab' : 'classroom',
          isProject: !!s.isProject,
        }));
      }
    });
    return pool;
  },

  getFaculty(subj, activeFaculty) {
    if (subj.facultyId) {
      const found = activeFaculty.find(f => String(f.id) === String(subj.facultyId));
      if (found) return found;
    }
    return activeFaculty.length > 0 ? this.rand(activeFaculty) : null;
  },

  // ── CREATE CHROMOSOME ─────────────────────────────────────
  createChromosome(faculty, rooms, labs, subjectPool) {
    const schedule      = {};
    const activeFaculty = faculty.filter(f => f.active == 1 || f.active === true);
    const availRooms    = rooms.filter(r => r.available == 1 || r.available === true);
    const availLabs     = labs.filter(l => l.available == 1 || l.available === true);

    const pickLabRoom = (pref) => {
      if (pref && availLabs.length > 0) {
        const m = availLabs.find(l => l.name && l.name.includes(pref));
        if (m) return m.name;
      }
      return availLabs.length > 0 ? this.rand(availLabs).name : (pref || 'Lab');
    };
    const pickRoom = () => availRooms.length > 0 ? this.rand(availRooms).name : 'TBD';

    // Faculty clash-aware picker — skips null/tbd/default IDs
    const pickFreeFaculty = (subj, day, slot) => {
      const busy = new Set();
      this.CLASSES.forEach(c => {
        const g = schedule[c]?.[day]?.[slot];
        if (
          g?.facultyId &&
          g.facultyId !== 'tbd' &&
          g.facultyId !== 'default' &&
          g?.type !== 'language' &&
          g?.type !== 'project'
        ) {
          busy.add(String(g.facultyId));
        }
      });
      if (subj.facultyId) {
        const preferred = activeFaculty.find(f => String(f.id) === String(subj.facultyId));
        if (preferred && !busy.has(String(preferred.id))) return preferred;
      }
      const free = activeFaculty.filter(f => !busy.has(String(f.id)));
      return free.length > 0 ? this.rand(free) : this.rand(activeFaculty);
    };

    // Init all slots empty
    this.CLASSES.forEach(cls => {
      schedule[cls] = {};
      this.DAYS.forEach(day => { schedule[cls][day] = {}; });
    });

    const isFree    = (cls, day, slot) => !schedule[cls][day][slot];
    const areFree   = (cls, day, slots) => slots.every(s => isFree(cls, day, s));
    const markSlots = (cls, day, slots, cell) => slots.forEach(s => { schedule[cls][day][s] = cell; });

    // ── STEP 1: PROJECT LABS ──────────────────────────────
    // III BCA only — fixed Mon 8-11 and Thu 8-11
    const projLabRooms = ['L1','L2','L3','L4'];
    this.YEAR3_CLS.forEach((cls, i) => {
      const projSubjs = (subjectPool[3]||[]).filter(s => s.isProject);
      if (!projSubjs.length) return;
      const proj = projSubjs[0];
      const room = projLabRooms[i] || pickLabRoom(proj.lab_room_pref);
      const f    = this.getFaculty(proj, activeFaculty);
      ['Mon','Thu'].forEach(day => {
        if (areFree(cls, day, [0,1,2])) {
          markSlots(cls, day, [0,1,2], {
            subject:     proj.name,
            facultyId:   f ? f.id   : 'tbd',
            facultyName: f ? f.name : 'TBD',
            facultyCode: f ? (f.code || f.name.split(' ').pop()) : 'TBD',
            room, type:'project', batch:'All', isLocked:true,
          });
        }
      });
    });

    // ── STEP 2: REGULAR LAB PAIRS ─────────────────────────
    // Place each B1+B2 pair once per week as a 3hr block
    // III BCA: only Tue/Wed/Fri allowed (Mon+Thu = Project Lab)
    [1,2,3].forEach(year => {
      const yearCls  = this.getClassesForYear(year);
      const labSubjs = (subjectPool[year]||[]).filter(s => s.isLab && !s.isProject && !s.saturdayLab);
      if (!labSubjs.length) return;

      const b1Pool = labSubjs.filter(s => s.lab_batch === 'B1' || s.lab_batch === 'both');
      const b2Pool = labSubjs.filter(s => s.lab_batch === 'B2' || s.lab_batch === 'both');
      const maxPairs = Math.max(b1Pool.length, b2Pool.length, 1);

      const pairs = [];
      for (let i = 0; i < maxPairs; i++) {
        pairs.push({
          b1: b1Pool[i] || null,
          b2: b2Pool[i] || null,
        });
      }

      // III BCA ML/MAD labs must NOT be on Mon or Thu (project lab days)
      const allowedDays = year === 3
        ? ['Tue', 'Wed', 'Fri']
        : [...this.WEEKDAYS];

      pairs.forEach(pair => {
        yearCls.forEach(cls => {
          let placed = false;
          for (const day of this.shuffle(allowedDays)) {
            if (placed) break;
            for (const block of this.shuffle(this.getLabBlocks(day))) {
              if (!areFree(cls, day, block)) continue;
              const f1 = pair.b1 ? pickFreeFaculty(pair.b1, day, block[0]) : null;
              const f2 = pair.b2 ? pickFreeFaculty(pair.b2, day, block[0]) : null;
              markSlots(cls, day, block, {
                subject:       pair.b1 ? pair.b1.name : (pair.b2 ? pair.b2.name : 'Lab'),
                facultyId:     f1 ? f1.id   : 'tbd',
                facultyName:   f1 ? f1.name : 'TBD',
                facultyCode:   f1 ? (f1.code || f1.name.split(' ').pop()) : 'TBD',
                room:          pair.b1 ? pickLabRoom(pair.b1.lab_room_pref) : pickLabRoom(null),
                type:'lab', batch:'B1', isLocked:true,
                b2Subject:     pair.b2 ? pair.b2.name : null,
                b2FacultyCode: f2 ? (f2.code || f2.name.split(' ').pop()) : null,
                b2Room:        pair.b2 ? pickLabRoom(pair.b2.lab_room_pref) : null,
                hasB2:         !!pair.b2,
              });
              placed = true;
              break;
            }
          }
        });
      });
    });

    // ── STEP 3: SATURDAY ──────────────────────────────────
    // Year 1 & 2: place 3rd lab pair on Saturday 8-11 IF that section
    //             hasn't already used Saturday for labs
    // Year 3: Saturday = theory only (ST/OR + ML + MERN STACK)
    this.CLASSES.forEach(cls => {
      const year = this.getYear(cls);

      if (year === 3) {
        // MERN Stack — Saturday slot 2 (10-11am) or 3 (11-12pm)
        const mern = (subjectPool[3]||[]).find(s => s.saturdayOnly || s.name.toLowerCase().includes('mern'));
        if (mern && isFree(cls, 'Sat', 3)) {
          const f = pickFreeFaculty(mern, 'Sat', 3);
          schedule[cls]['Sat'][3] = {
            subject:     mern.name,
            facultyId:   f ? f.id   : 'tbd',
            facultyName: f ? f.name : 'TBD',
            facultyCode: f ? (f.code || f.name.split(' ').pop()) : 'TBD',
            room: pickRoom(), type:'theory', isLocked:true,
          };
        }
        return;
      }

      // Only place Saturday lab if slots 0-2 are still free
      // (some sections have their 3rd lab on Fri afternoon instead)
      if (!areFree(cls, 'Sat', [0,1,2])) return;

      const satLabSubjs = (subjectPool[year]||[]).filter(s => s.isLab && !s.isProject && s.saturdayLab);

      // If no explicit saturday labs defined, pick from remaining unplaced labs
      let b1, b2;
      if (satLabSubjs.length > 0) {
        b1 = satLabSubjs.find(s => s.lab_batch === 'B1') || null;
        b2 = satLabSubjs.find(s => s.lab_batch === 'B2') || null;
      } else {
        // Fallback: use any lab subject not yet placed this week
        const allLabs = (subjectPool[year]||[]).filter(s => s.isLab && !s.isProject);
        const b1Pool  = allLabs.filter(s => s.lab_batch === 'B1');
        const b2Pool  = allLabs.filter(s => s.lab_batch === 'B2');
        b1 = b1Pool.length ? this.rand(b1Pool) : null;
        b2 = b2Pool.length ? this.rand(b2Pool) : null;
      }

      if (!b1 && !b2) return;

      const f1 = b1 ? pickFreeFaculty(b1, 'Sat', 0) : null;
      const f2 = b2 ? pickFreeFaculty(b2, 'Sat', 0) : null;

      markSlots(cls, 'Sat', [0,1,2], {
        subject:       b1 ? b1.name : (b2 ? b2.name : 'Lab'),
        facultyId:     f1 ? f1.id   : 'tbd',
        facultyName:   f1 ? f1.name : 'TBD',
        facultyCode:   f1 ? (f1.code || f1.name.split(' ').pop()) : 'TBD',
        room:          b1 ? pickLabRoom(b1.lab_room_pref) : pickLabRoom(null),
        type:'lab', batch:'B1', isLocked:true,
        b2Subject:     b2 ? b2.name : null,
        b2FacultyCode: f2 ? (f2.code || f2.name.split(' ').pop()) : null,
        b2Room:        b2 ? pickLabRoom(b2.lab_room_pref) : null,
        hasB2:         !!b2,
      });
    });

    // ── STEP 4: LANGUAGE ──────────────────────────────────
    // One slot per weekday, Mon-Fri (5 slots total)
    // All sections of same year must share the SAME slot each day
    [1,2].forEach(year => {
      const yearCls   = this.getClassesForYear(year);
      const langSubjs = (subjectPool[year]||[]).filter(s => s.isLang);
      if (!langSubjs.length) return;

      let placed = 0;
      // Try each weekday — must place exactly 1 language slot per day
      for (const day of this.shuffle([...this.WEEKDAYS])) {
        if (placed >= 5) break;
        // Check no language already placed today for this year
        const alreadyToday = yearCls.some(cls =>
          this.getSlots(day).some(s => schedule[cls][day][s]?.type === 'language')
        );
        if (alreadyToday) continue;

        // Find a slot free for ALL sections of this year
        // Skip slot 0 on weekdays (reserved for lab blocks)
        const candidateSlots = this.getSlots(day).filter(s => s !== 0 && s !== 8);
        for (const slot of this.shuffle(candidateSlots)) {
          if (!yearCls.every(cls => isFree(cls, day, slot))) continue;
          // Place each section's language in the same slot
          yearCls.forEach((cls, i) => {
            const lang = langSubjs[i % langSubjs.length];
            const f    = pickFreeFaculty(lang, day, slot);
            schedule[cls][day][slot] = {
              subject:     lang.name,
              facultyId:   f ? f.id   : 'tbd',
              facultyName: f ? f.name : 'TBD',
              facultyCode: f ? (f.code || f.name.split(' ').pop()) : 'TBD',
              room:        lang.language_room || pickRoom(),
              type:'language', langCode: lang.language_code || 'K', isLocked:true,
            };
          });
          placed++;
          break;
        }
      }
    });

    // ── STEP 5: SHARED LECTURES ───────────────────────────
    // e.g. WP/DA/DS for II BCA — all sections, same slot, different rooms
    [1,2,3].forEach(year => {
      const yearCls     = this.getClassesForYear(year);
      const sharedSubjs = (subjectPool[year]||[]).filter(s => s.isShared);
      if (!sharedSubjs.length) return;

      sharedSubjs.forEach(subj => {
        const roomList = subj.shared_rooms
          ? subj.shared_rooms.split(',').map(r => r.trim())
          : yearCls.map(() => pickRoom());
        const target = subj.periodsPerWeek || 3;
        let placed = 0;

        // Skip slot 0 and slot 8 for shared theory
        const theorySlots = this.WORK_SLOTS.filter(s => s !== 0 && s !== 8);

        for (const day of this.shuffle(this.WEEKDAYS)) {
          if (placed >= target) break;
          for (const slot of this.shuffle(theorySlots)) {
            if (placed >= target) break;
            if (!yearCls.every(cls => isFree(cls, day, slot))) continue;
            const f = pickFreeFaculty(subj, day, slot);
            yearCls.forEach((cls, i) => {
              schedule[cls][day][slot] = {
                subject:     subj.name,
                facultyId:   f ? f.id   : 'tbd',
                facultyName: f ? f.name : 'TBD',
                facultyCode: f ? (f.code || f.name.split(' ').pop()) : 'TBD',
                room:        roomList[i] || pickRoom(),
                type:'theory', isShared:true, isLocked:true,
              };
            });
            placed++;
          }
        }
      });
    });

    // ── STEP 6: THEORY ────────────────────────────────────
    // Quota-based — places subjects up to periodsPerWeek
    // Leaves gaps naturally (slot 0 weekdays + slot 8 blocked)
    this.CLASSES.forEach(cls => {
      const year     = this.getYear(cls);
      const subjects = subjectPool[year] || [];
      const theory   = subjects.filter(s => !s.isLab && !s.isLang && !s.isShared);

      const useTheory = theory.length > 0 ? theory
        : this.DEFAULT_SUBJECTS[year]
            .filter(s => !s.isLab && !s.isLang && !s.isShared)
            .map(s => ({ ...s, facultyId:null, facultyName:'TBD', facultyCode:'TBD' }));

      if (!useTheory.length) return;

      const placedCount = {};
      useTheory.forEach(s => { placedCount[s.name] = 0; });

      // Track which subjects already appear on each day (no same-day repeat)
      const usedOnDay = {};
      this.DAYS.forEach(d => {
        usedOnDay[d] = new Set();
        this.getSlots(d).forEach(s => {
          const g = schedule[cls][d][s];
          if (g?.subject) usedOnDay[d].add(g.subject);
        });
      });

      // Build list of eligible free slots — respecting BMS structure:
      // • slot 0 on weekdays = lab block starts only, never theory
      // • slot 8 (4-5pm) on weekdays = almost never used, leave empty
      // • Saturday: theory allowed in slots 1,2,3 only (slot 0 used for lab or theory)
      const freeSlots = [];
      this.DAYS.forEach(day => {
        this.getSlots(day).forEach(slot => {
          if (!isFree(cls, day, slot)) return;
          if (day !== 'Sat') {
            if (slot === 0) return; // weekday 8am = lab blocks only
            if (slot === 8) return; // weekday 4-5pm = leave empty
          }
          freeSlots.push({ day, slot });
        });
      });
      this.shuffle(freeSlots);

      for (const { day, slot } of freeSlots) {
        if (!isFree(cls, day, slot)) continue;

        // Saturday: max 2 theory slots total
        if (day === 'Sat') {
          const satTheory = this.SAT_SLOTS.filter(s => schedule[cls]['Sat'][s]?.type === 'theory').length;
          if (satTheory >= 2) continue;
        }

        // Build eligible subject list for this slot
        const eligible = useTheory.filter(s => {
          if (placedCount[s.name] >= (s.periodsPerWeek || 4)) return false;
          if (usedOnDay[day].has(s.name)) return false;
          // MERN Stack = Saturday only
          if (s.saturdayOnly && day !== 'Sat') return false;
          // Library = Wednesday slot 2 (10-11am) only
          if (s.isLibrary && !(day === 'Wed' && slot === 2)) return false;
          return true;
        });

        if (!eligible.length) continue;

        // Prioritise most under-placed subjects first
        eligible.sort((a, b) => placedCount[a.name] - placedCount[b.name]);
        const subj = eligible[0];

        // Find a free faculty for this slot
        const busyAtSlot = new Set();
        this.CLASSES.forEach(c => {
          const g = schedule[c]?.[day]?.[slot];
          if (
            g?.facultyId &&
            g.facultyId !== 'tbd' &&
            g.facultyId !== 'default' &&
            g?.type !== 'language' &&
            g?.type !== 'project'
          ) {
            busyAtSlot.add(String(g.facultyId));
          }
        });

        let f;
        if (subj.facultyId) {
          const preferred = activeFaculty.find(fac => String(fac.id) === String(subj.facultyId));
          if (preferred && !busyAtSlot.has(String(preferred.id))) {
            f = preferred;
          }
        }
        if (!f) {
          const free = activeFaculty.filter(fac => !busyAtSlot.has(String(fac.id)));
          f = free.length ? this.rand(free) : (activeFaculty.length ? this.rand(activeFaculty) : null);
        }

        schedule[cls][day][slot] = {
          subject:     subj.name,
          facultyId:   f ? f.id   : 'tbd',
          facultyName: f ? f.name : 'TBD',
          facultyCode: f ? (f.code || f.name.split(' ').pop()) : 'TBD',
          room:        pickRoom(),
          type:        'theory',
        };
        placedCount[subj.name]++;
        usedOnDay[day].add(subj.name);
      }
    });

    return schedule;
  },

  // ── FITNESS FUNCTION ──────────────────────────────────────
  fitness(schedule, labs) {
    let penalty = 0;
    const violations = {
      facultyClash:0, subjectRepeat:0, consecutive:0,
      blockedSlot:0, unbalanced:0, labBlock:0, langSync:0,
    };

    // 1. Faculty clash — same faculty in two classes same slot
    this.DAYS.forEach(day => {
      this.getSlots(day).forEach(slot => {
        const seen = {};
        this.CLASSES.forEach(cls => {
          const g = schedule[cls]?.[day]?.[slot];
          if (g?.type === 'language' || g?.type === 'project') return;
          if (g?.facultyId && g.facultyId !== 'tbd' && g.facultyId !== 'default') {
            if (seen[g.facultyId]) { penalty += 100; violations.facultyClash++; }
            seen[g.facultyId] = true;
          }
        });
      });
    });

    // 2. Subject repeat same day — theory only
    this.CLASSES.forEach(cls => {
      this.DAYS.forEach(day => {
        const seen = {};
        this.getSlots(day).forEach(slot => {
          const g = schedule[cls]?.[day]?.[slot];
          if (g?.subject && g.type !== 'lab' && g.type !== 'project' && g.type !== 'language') {
            if (seen[g.subject]) { penalty += 20; violations.subjectRepeat++; }
            seen[g.subject] = true;
          }
        });
      });
    });

    // 3. Consecutive same theory > 2 back-to-back
    this.CLASSES.forEach(cls => {
      this.DAYS.forEach(day => {
        const slots = this.getSlots(day);
        let streak = 1;
        for (let i = 1; i < slots.length; i++) {
          const prev = schedule[cls]?.[day]?.[slots[i-1]];
          const curr = schedule[cls]?.[day]?.[slots[i]];
          if (prev?.subject && curr?.subject && prev.subject === curr.subject
              && prev.type === 'theory' && curr.type === 'theory') {
            streak++;
            if (streak > 2) { penalty += 15; violations.consecutive++; }
          } else { streak = 1; }
        }
      });
    });

    // 4. Blocked lab slots (from rooms config)
    const sharedLabs = (labs||[]).filter(l => l.labtype === 'shared' && l.blockedSlots?.length > 0);
    sharedLabs.forEach(lab => {
      (lab.blockedSlots||[]).forEach(key => {
        const [day, ...rest] = key.split('_');
        const slotIndex = this.SLOT_LABELS.indexOf(rest.join('_'));
        if (slotIndex < 0) return;
        this.CLASSES.forEach(cls => {
          const g = schedule[cls]?.[day]?.[slotIndex];
          if (g?.room === lab.name) { penalty += 25; violations.blockedSlot++; }
        });
      });
    });

    // 5. Subject spread — penalise if same subject appears 5+ days
    this.CLASSES.forEach(cls => {
      const subDays = {};
      this.DAYS.forEach(day => {
        this.getSlots(day).forEach(slot => {
          const g = schedule[cls]?.[day]?.[slot];
          if (g?.subject && g.type === 'theory') {
            if (!subDays[g.subject]) subDays[g.subject] = new Set();
            subDays[g.subject].add(day);
          }
        });
      });
      Object.values(subDays).forEach(days => {
        if (days.size >= 5) { penalty += 10; violations.unbalanced++; }
      });
    });

    // 6. Lab not in valid 3-hour block
    this.CLASSES.forEach(cls => {
      this.DAYS.forEach(day => {
        this.getSlots(day).forEach(slot => {
          const g = schedule[cls]?.[day]?.[slot];
          if (g?.type === 'lab' || g?.type === 'project') {
            const inBlock = this.getLabBlocks(day).some(b => b.includes(slot));
            if (!inBlock) { penalty += 30; violations.labBlock++; }
          }
        });
      });
    });

    // 6b. III BCA non-project lab on Mon or Thu = violation
    this.YEAR3_CLS.forEach(cls => {
      ['Mon','Thu'].forEach(day => {
        this.getSlots(day).forEach(slot => {
          const g = schedule[cls]?.[day]?.[slot];
          if (g?.type === 'lab' && !g?.isProject && g?.type !== 'project') {
            penalty += 50; violations.labBlock++;
          }
        });
      });
    });

    // 7. Language sync — all sections of year must have language same slot
    [1,2].forEach(year => {
      const yearCls = this.getClassesForYear(year);
      this.DAYS.forEach(day => {
        this.getSlots(day).forEach(slot => {
          const langCount = yearCls.filter(cls => schedule[cls]?.[day]?.[slot]?.type === 'language').length;
          if (langCount > 0 && langCount < yearCls.length) {
            penalty += 10 * (yearCls.length - langCount);
            violations.langSync++;
          }
        });
      });
    });

    // 8. Saturday afternoon slots must be empty
    this.CLASSES.forEach(cls => {
      [5,6,7,8].forEach(slot => {
        if (schedule[cls]?.['Sat']?.[slot]) { penalty += 50; violations.unbalanced++; }
      });
    });

    // 9. Theory in slot 0 on weekdays = violation
    this.CLASSES.forEach(cls => {
      this.WEEKDAYS.forEach(day => {
        const g = schedule[cls]?.[day]?.[0];
        if (g?.type === 'theory') { penalty += 30; violations.unbalanced++; }
      });
    });

    // Score: 0-conflict schedule = 100%
    // Divisor 15000 ensures clean schedule hits 100%
    const score = Math.max(0, Math.min(100, 100 - (penalty / 15000) * 100));
    console.log('Penalty:', penalty, 'Violations:', violations);
    return { score: parseFloat(score.toFixed(2)), penalty, violations };
  },

  // ── SELECTION ─────────────────────────────────────────────
  select(population, scores) {
    let best = null, bestScore = -1;
    for (let i = 0; i < 4; i++) {
      const idx = Math.floor(Math.random() * population.length);
      if (scores[idx] > bestScore) { bestScore = scores[idx]; best = population[idx]; }
    }
    return best;
  },

  // ── CROSSOVER ─────────────────────────────────────────────
  // Swap whole year groups between parents — keeps lab/project locked slots intact
  crossover(p1, p2) {
    const child = {};
    [['I_A','I_B'],['II_A','II_B','II_C','II_D'],['III_A','III_B','III_C']].forEach(group => {
      const src = Math.random() < 0.5 ? p1 : p2;
      group.forEach(cls => { child[cls] = JSON.parse(JSON.stringify(src[cls])); });
    });
    return child;
  },

  // ── MUTATION ──────────────────────────────────────────────
  // Only mutates unlocked theory slots, respects BMS slot rules
  mutate(schedule, faculty, rooms, labs, subjectPool, rate) {
    const activeFaculty = faculty.filter(f => f.active == 1 || f.active === true);
    const availRooms    = rooms.filter(r => r.available == 1 || r.available === true);
    const pickRoom = () => availRooms.length > 0 ? this.rand(availRooms).name : 'TBD';

    this.CLASSES.forEach(cls => {
      const year   = this.getYear(cls);
      const theory = (subjectPool[year]||[]).filter(s => !s.isLab && !s.isLang && !s.isShared);
      if (!theory.length) return;

      this.DAYS.forEach(day => {
        this.getSlots(day).forEach(slot => {
          if (Math.random() >= rate) return;
          const existing = schedule[cls]?.[day]?.[slot];
          if (!existing || existing.isLocked || existing.type !== 'theory') return;

          // Respect slot 0 and slot 8 rules
          if (slot === 0 && day !== 'Sat') return;
          if (slot === 8 && day !== 'Sat') return;

          const usedToday = new Set(
            this.getSlots(day).map(s => schedule[cls]?.[day]?.[s]?.subject).filter(Boolean)
          );
          const eligible = theory.filter(s => {
            if (usedToday.has(s.name) && s.name !== existing.subject) return false;
            if (s.saturdayOnly && day !== 'Sat') return false;
            if (s.isLibrary && !(day === 'Wed' && slot === 2)) return false;
            return true;
          });
          const subj = eligible.length ? this.rand(eligible) : this.rand(theory);

          const busyAtSlot = new Set();
          this.CLASSES.forEach(c => {
            const g = schedule[c]?.[day]?.[slot];
            if (
              g?.facultyId && g.facultyId !== 'tbd' && g.facultyId !== 'default' &&
              g?.type !== 'language' && g?.type !== 'project'
            ) busyAtSlot.add(String(g.facultyId));
          });

          let f = null;
          if (subj.facultyId) {
            const preferred = activeFaculty.find(fac => String(fac.id) === String(subj.facultyId));
            if (preferred && !busyAtSlot.has(String(preferred.id))) f = preferred;
          }
          if (!f) {
            const free = activeFaculty.filter(fac => !busyAtSlot.has(String(fac.id)));
            f = free.length ? this.rand(free) : (activeFaculty.length ? this.rand(activeFaculty) : null);
          }
          if (!f) return;

          schedule[cls][day][slot] = {
            subject:     subj.name,
            facultyId:   f.id,
            facultyName: f.name,
            facultyCode: f.code || f.name.split(' ').pop(),
            room:        pickRoom(),
            type:        'theory',
          };
        });
      });
    });
    return schedule;
  },

  // ── MAIN RUN ──────────────────────────────────────────────
  run({ faculty, rooms, labs, allSubjects,
        populationSize = 100, maxGenerations = 500,
        mutationRate   = 0.08, elitismPct    = 0.10,
        targetFitness  = 100,
        onGeneration   = () => {},
        onComplete     = () => {} }) {

    const subjectPool = (allSubjects && allSubjects.length > 0)
      ? this.buildSubjectPoolFromDB(allSubjects, faculty)
      : this.buildSubjectPoolFromDB([], faculty);

    console.log('GA v5 Subject pool:', {
      yr1: subjectPool[1].map(s => `${s.name}[${s.periodsPerWeek}pw]`),
      yr2: subjectPool[2].map(s => `${s.name}[${s.periodsPerWeek}pw]`),
      yr3: subjectPool[3].map(s => `${s.name}[${s.periodsPerWeek}pw]`),
    });

    let population = Array.from({ length: populationSize }, () =>
      this.createChromosome(faculty, rooms, labs, subjectPool)
    );

    let gen = 0;
    let bestSchedule = null, bestScore = -1, bestViolations = {};
    const eliteCount = Math.max(1, Math.floor(populationSize * elitismPct));

    const step = () => {
      try {
        gen++;
        const evaluated = population.map(sched => {
          const { score, penalty, violations } = this.fitness(sched, labs);
          return { schedule:sched, score, penalty, violations };
        });
        evaluated.sort((a, b) => b.score - a.score);

        if (evaluated[0].score >= bestScore) {
          bestScore      = evaluated[0].score;
          bestSchedule   = evaluated[0].schedule;
          bestViolations = evaluated[0].violations;
        }

        onGeneration({
          gen, bestScore,
          avgScore:   evaluated.reduce((s, e) => s + e.score, 0) / evaluated.length,
          violations: bestViolations,
          penalty:    evaluated[0].penalty,
        });

        if (gen >= maxGenerations || bestScore >= targetFitness) {
          onComplete({ schedule:bestSchedule, score:bestScore, gen, violations:bestViolations });
          return;
        }

        const scores    = evaluated.map(e => e.score);
        const schedules = evaluated.map(e => e.schedule);
        const nextGen   = schedules.slice(0, eliteCount).map(s => JSON.parse(JSON.stringify(s)));

        while (nextGen.length < populationSize) {
          let child = this.crossover(
            this.select(schedules, scores),
            this.select(schedules, scores)
          );
          child = this.mutate(child, faculty, rooms, labs, subjectPool, mutationRate);
          nextGen.push(child);
        }

        population = nextGen;
        setTimeout(step, 0);

      } catch (err) {
        console.error('GA v5 crashed at gen', gen, ':', err);
        onComplete({
          schedule:   bestSchedule || population[0] || {},
          score:      bestScore < 0 ? 0 : bestScore,
          gen, violations: bestViolations,
        });
      }
    };

    setTimeout(step, 0);
  }
};
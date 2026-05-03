// ════════════════════════════════════════════════════════════
// TIMETRIX — GENETIC ALGORITHM ENGINE v3
// BMS College for Women, Bengaluru — BCA Department
//
// REAL CONSTRAINTS FROM ACTUAL BMS TIMETABLE (PDF):
//
// 1. LAB BLOCKS — 3 consecutive hours per section per week
//    B1 and B2 do DIFFERENT subjects simultaneously:
//    e.g. DS–B1–L2 and OS–B2–L3 at same time same day
//    Each lab subject has lab_batch = 'B1' or 'B2'
//    Matching B1+B2 pairs are paired and placed together
//
// 2. LANGUAGE (K/H/S) — nearly daily (most weekdays)
//    ALL sections of same year share the same slot
//    Each section goes to their own language room
//    language_code tells us K/H/S, language_room is the room
//
// 3. SHARED LECTURES (e.g. WP/DA/DS for II BCA)
//    All sections of a year attend the SAME slot
//    Each section uses a different room from shared_rooms
//
// 4. No faculty double-booking across any sections
// 5. No subject repeating on same day (theory only)
// 6. Max 2 consecutive periods of same theory subject
// 7. Saturday: half day (slots 0–3 only, 8:00–12:00)
// 8. Labs on Saturday allowed (8:00–11:00 block only)
// 9. Subject spread: avoid same subject 5+ days/week
// ════════════════════════════════════════════════════════════

const GA = {

  CLASSES:   ['I_A','I_B','II_A','II_B','II_C','II_D','III_A','III_B','III_C'],
  YEAR1_CLS: ['I_A','I_B'],
  YEAR2_CLS: ['II_A','II_B','II_C','II_D'],
  YEAR3_CLS: ['III_A','III_B','III_C'],
  DAYS:      ['Mon','Tue','Wed','Thu','Fri','Sat'],
  WEEKDAYS:  ['Mon','Tue','Wed','Thu','Fri'],

  // Slot indices (LUNCH=4 is skipped in scheduling)
  // 0=8-9, 1=9-10, 2=10-11, 3=11-12, [4=LUNCH],
  // 5=1-2, 6=2-3, 7=3-4, 8=4-5
  WORK_SLOTS: [0,1,2,3,5,6,7,8],
  SAT_SLOTS:  [0,1,2,3],

  // Valid 3-hour consecutive lab blocks (no lunch crossing)
  // Morning: 8-11 [0,1,2] or 9-12 [1,2,3]
  // Afternoon: 1-4 [5,6,7] or 2-5 [6,7,8]
  // Saturday morning only: [0,1,2]
  LAB_BLOCKS_WEEK: [[0,1,2],[1,2,3],[5,6,7],[6,7,8]],
  LAB_BLOCKS_SAT:  [[0,1,2]],

  SLOT_LABELS: [
    '8:00-9:00','9:00-10:00','10:00-11:00','11:00-12:00',
    'LUNCH',
    '1:00-2:00','2:00-3:00','3:00-4:00','4:00-5:00'
  ],

  // ── DEFAULT SUBJECTS (used when DB is empty) ──
  // Modelled after the actual BMS timetable PDF
  DEFAULT_SUBJECTS: {
    1: [
      { name:'C Programming',   isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'Data Structures', isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'Java',            isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'OS',              isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'English',         isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'EVS',             isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'Kannada',         isLab:false, isLang:true,  isShared:false, lab_batch:null, language_code:'K',  language_room:'209'  },
      { name:'Hindi',           isLab:false, isLang:true,  isShared:false, lab_batch:null, language_code:'H',  language_room:'229'  },
      { name:'Sanskrit',        isLab:false, isLang:true,  isShared:false, lab_batch:null, language_code:'S',  language_room:'125'  },
      { name:'Java Lab',        isLab:true,  isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'L2'   },
      { name:'DS Lab',          isLab:true,  isLang:false, isShared:false, lab_batch:'B2', language_code:null, lab_room_pref:'L3'   },
      { name:'OS Lab',          isLab:true,  isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'EL'   },
    ],
    2: [
      { name:'ADA',             isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'AI',              isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'Problem Solving', isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'English',         isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'IKS',             isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'WP/DA/DS',        isLab:false, isLang:false, isShared:true,  lab_batch:null, language_code:null, shared_rooms:'311,308,316,310B' },
      { name:'Kannada',         isLab:false, isLang:true,  isShared:false, lab_batch:null, language_code:'K',  language_room:'314'  },
      { name:'Hindi',           isLab:false, isLang:true,  isShared:false, lab_batch:null, language_code:'H',  language_room:'221A' },
      { name:'Sanskrit',        isLab:false, isLang:true,  isShared:false, lab_batch:null, language_code:'S',  language_room:'125'  },
      { name:'AI Lab',          isLab:true,  isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'L2'   },
      { name:'PS Lab',          isLab:true,  isLang:false, isShared:false, lab_batch:'B2', language_code:null, lab_room_pref:'L3'   },
      { name:'ADA Lab',         isLab:true,  isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'L4'   },
    ],
    3: [
      { name:'Machine Learning',  isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'Mobile App Dev',    isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'Software Testing',  isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'ECD',               isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'MERN Stack',        isLab:false, isLang:false, isShared:false, lab_batch:null, language_code:null },
      { name:'ML Lab',            isLab:true,  isLang:false, isShared:false, lab_batch:'B1', language_code:null, lab_room_pref:'L4'   },
      { name:'MAD Lab',           isLab:true,  isLang:false, isShared:false, lab_batch:'B2', language_code:null, lab_room_pref:'L1'   },
      { name:'Project Lab',       isLab:true,  isLang:false, isShared:false, lab_batch:'both', language_code:null, lab_room_pref:'L1' },
    ]
  },

  // ── HELPERS ───────────────────────────────────
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

  isLabSubject(name) { return name && name.toLowerCase().includes('lab'); },
  isLangSubject(name) {
    if (!name) return false;
    return ['kannada','hindi','sanskrit'].some(l => name.toLowerCase().includes(l));
  },

  // ════════════════════════════════════════════════
  // BUILD SUBJECT POOL FROM DATABASE RECORDS
  // Now reads: lab_batch, language_code, language_room,
  //            is_shared, shared_rooms, lab_room_pref
  // ════════════════════════════════════════════════
  buildSubjectPoolFromDB(allSubjects, faculty) {
    const pool = { 1:[], 2:[], 3:[] };
    const fMap = {};
    faculty.forEach(f => { fMap[f.id] = f; });

    allSubjects.forEach(sub => {
      const year = parseInt(sub.year);
      if (!year || year < 1 || year > 3) return;
      const f = fMap[sub.faculty_id];
      const isLab  = sub.type === 'lab' || sub.type === 'project';
      const isLang = sub.type === 'language';
      const isShared = sub.is_shared === 'yes' || sub.is_shared === true || sub.is_shared === 1;

      const entry = {
        name:          sub.name,
        code:          sub.code || '',
        isLab,
        isLang,
        isShared,
        isProject:     sub.type === 'project',
        lab_batch:     sub.lab_batch   || (isLab ? 'B1' : null),
        lab_room_pref: sub.lab_room_pref || null,
        language_code: sub.language_code || null,
        language_room: sub.language_room || null,
        shared_rooms:  sub.shared_rooms  || null,
        facultyId:     sub.faculty_id    || 'default',
        facultyName:   f ? f.name : 'TBD',
        facultyCode:   f ? (f.code || f.name.split(' ').pop()) : 'TBD',
        periodsPerWeek: sub.periods_per_week || (isLab ? 3 : isLang ? 5 : 4),
        room_type:     sub.room_type || (isLab ? 'lab' : 'classroom'),
      };
      if (!pool[year].find(s => s.name === sub.name)) pool[year].push(entry);
    });

    // Fill with defaults for any empty year
    [1,2,3].forEach(y => {
      if (pool[y].length === 0) {
        pool[y] = this.DEFAULT_SUBJECTS[y].map(s => ({
          ...s,
          code:'', facultyId:'default', facultyName:'TBD', facultyCode:'TBD',
          periodsPerWeek: s.isLab ? 3 : s.isLang ? 5 : 4,
          room_type: s.isLab ? 'lab' : 'classroom',
          isProject: false,
        }));
      }
    });

    return pool;
  },

  // Fallback: build from faculty.subjects strings
  buildSubjectPool(faculty) {
    const pool = { 1:[], 2:[], 3:[] };
    faculty.forEach(f => {
      (f.subjects || []).forEach(sub => {
        const name = typeof sub === 'string' ? sub : sub.name;
        if (!name) return;
        const isLab  = this.isLabSubject(name);
        const isLang = this.isLangSubject(name);
        const entry = {
          name, code:'', isLab, isLang, isShared:false, isProject:false,
          lab_batch: isLab ? 'B1' : null,
          lab_room_pref: null, language_code: null, language_room: null, shared_rooms: null,
          facultyId: f.id, facultyName: f.name,
          facultyCode: f.code || f.name.split(' ').pop(),
          periodsPerWeek: isLab ? 3 : isLang ? 5 : 4,
          room_type: isLab ? 'lab' : 'classroom',
        };
        [1,2,3].forEach(y => {
          if (!pool[y].find(s => s.name === name)) pool[y].push({...entry});
        });
      });
    });
    [1,2,3].forEach(y => {
      if (pool[y].length === 0) {
        pool[y] = this.DEFAULT_SUBJECTS[y].map(s => ({
          ...s,
          code:'', facultyId:'default', facultyName:'TBD', facultyCode:'TBD',
          periodsPerWeek: s.isLab ? 3 : s.isLang ? 5 : 4,
          room_type: s.isLab ? 'lab' : 'classroom', isProject:false,
        }));
      }
    });
    return pool;
  },

  // ── GET FACULTY FOR SUBJECT ───────────────────
  getFaculty(subj, activeFaculty) {
    return activeFaculty.find(f => String(f.id) === String(subj.facultyId))
        || (activeFaculty.length > 0 ? this.rand(activeFaculty) : null);
  },

  // ════════════════════════════════════════════════
  // CHROMOSOME CREATION
  //
  // Order of placement (mirrors real timetable logic):
  // Step 1 — Project Labs (III BCA): fixed morning block Mon+Thu
  // Step 2 — Lab pairs (B1+B2 different subjects, same 3hr block)
  // Step 3 — Saturday lab blocks
  // Step 4 — Language (K/H/S): same slot ALL sections of year
  //           placed on multiple weekdays (nearly daily)
  // Step 5 — Shared lectures: same slot all sections, diff rooms
  // Step 6 — Fill remaining with theory (no repeat same day)
  // ════════════════════════════════════════════════
  createChromosome(faculty, rooms, labs, subjectPool) {
    const schedule      = {};
    const activeFaculty = faculty.filter(f => f.active == 1 || f.active === true);
    const availRooms    = rooms.filter(r => r.available == 1 || r.available === true);
    const availLabs     = labs.filter(l  => l.available == 1 || l.available === true);

    // Helper: pick a lab room by preference code
    const pickLabRoom = (pref) => {
      if (pref && availLabs.length > 0) {
        const match = availLabs.find(l => l.name && l.name.includes(pref));
        if (match) return match.name;
      }
      return availLabs.length > 0 ? this.rand(availLabs).name : (pref || 'Lab');
    };

    const pickRoom = () => availRooms.length > 0 ? this.rand(availRooms).name : 'TBD';
    const pickFreeFaculty = (subj, day, slot) => {
    const busy = new Set();
    this.CLASSES.forEach(c => {
        const g = schedule[c]?.[day]?.[slot];
        // Don't count language faculty as busy — they teach multiple classes same slot
        if (g?.facultyId && g?.type !== 'language') busy.add(String(g.facultyId));
      });
    const preferred = activeFaculty.find(f => String(f.id) === String(subj.facultyId));
    if (preferred && !busy.has(String(preferred.id))) return preferred;
   const free = activeFaculty.filter(f => !busy.has(String(f.id)));
    return free.length > 0 ? this.rand(free) : this.rand(activeFaculty);
  };
  
    // Init empty schedule
    this.CLASSES.forEach(cls => {
      schedule[cls] = {};
      this.DAYS.forEach(day => { schedule[cls][day] = {}; });
    });

    const slotsUsed = (cls, day, slots) => slots.every(s => !schedule[cls][day][s]);
    const markSlots = (cls, day, slots, cell) => slots.forEach(s => { schedule[cls][day][s] = cell; });

    // ── STEP 1: PROJECT LABS (III BCA) ───────────
    // Project Lab runs Mon+Thu morning (8-11) in different lab rooms per section
    [3].forEach(year => {
      const yearCls = this.getClassesForYear(year);
      const projSubjs = (subjectPool[year]||[]).filter(s => s.isProject || s.name.toLowerCase().includes('project'));
      if (projSubjs.length === 0) return;

      const projSubj = projSubjs[0];
      const projDays = ['Mon','Thu'];
      const projBlock = [0,1,2]; // 8-11

      yearCls.forEach((cls, i) => {
        const f = this.getFaculty(projSubj, activeFaculty);
        const room = availLabs.length > i ? availLabs[i].name : pickLabRoom(projSubj.lab_room_pref);
        projDays.forEach(day => {
          if (slotsUsed(cls, day, projBlock)) {
            markSlots(cls, day, projBlock, {
              subject:     projSubj.name,
              facultyId:   f ? f.id   : 'tbd',
              facultyName: f ? f.name : 'TBD',
              facultyCode: f ? (f.code || f.name.split(' ').pop()) : 'TBD',
              room,
              type:        'project',
              batch:       'All',
              isLocked:    true,
            });
          }
        });
      });
    });

    // ── STEP 2: LAB PAIRS (weekday B1 + B2) ──────
    // each section gets multiple lab blocks per week
    // B1 and B2 are DIFFERENT subjects at the SAME time
    // e.g. DS–B1–L2 and OS–B2–L3 simultaneously
    [1,2,3].forEach(year => {
      const yearCls   = this.getClassesForYear(year);
      const labSubjs  = (subjectPool[year]||[]).filter(s => s.isLab && !s.isProject);
      if (labSubjs.length === 0) return;

      // Group into B1 and B2 pools
      const b1Pool = labSubjs.filter(s => s.lab_batch === 'B1' || s.lab_batch === 'both');
      const b2Pool = labSubjs.filter(s => s.lab_batch === 'B2' || s.lab_batch === 'both');

      // Pair them up: each pair runs simultaneously
      // If unequal, cycle the shorter list
      const maxPairs = Math.max(b1Pool.length, b2Pool.length, 1);
      const pairs = [];
      for (let i = 0; i < maxPairs; i++) {
        pairs.push({
          b1: b1Pool.length > 0 ? b1Pool[i % b1Pool.length] : null,
          b2: b2Pool.length > 0 ? b2Pool[i % b2Pool.length] : null,
        });
      }

      // Assign each pair to a day+block for every section
      const shuffledDays = this.shuffle(this.WEEKDAYS);

      pairs.forEach((pair, pi) => {
        yearCls.forEach(cls => {
          let placed = false;

          // Try each day+block combination
          const daysToTry = this.shuffle(this.WEEKDAYS);
          for (const day of daysToTry) {
            const blocks = this.getLabBlocks(day);
            for (const block of this.shuffle(blocks)) {
              if (!slotsUsed(cls, day, block)) continue;

              const f1 = pair.b1 ? pickFreeFaculty(pair.b1, day, block[0]) : null;
              const f2 = pair.b2 ? pickFreeFaculty(pair.b2, day, block[0]) : null;
              const r1 = pair.b1 ? pickLabRoom(pair.b1.lab_room_pref) : pickLabRoom(null);
              const r2 = pair.b2 ? pickLabRoom(pair.b2.lab_room_pref) : pickLabRoom(null);

              markSlots(cls, day, block, {
                // Primary entry is B1 subject
                subject:      pair.b1 ? pair.b1.name : (pair.b2 ? pair.b2.name : 'Lab'),
                facultyId:    f1 ? f1.id   : 'tbd',
                facultyName:  f1 ? f1.name : 'TBD',
                facultyCode:  f1 ? (f1.code || f1.name.split(' ').pop()) : 'TBD',
                room:         r1,
                type:         'lab',
                batch:        'B1',
                isLocked:     true,
                // B2 parallel info (different subject same time)
                b2Subject:    pair.b2 ? pair.b2.name : null,
                b2FacultyCode: f2 ? (f2.code || f2.name.split(' ').pop()) : null,
                b2Room:       r2,
                hasB2:        !!pair.b2,
              });

              placed = true;
              break;
            }
            if (placed) break;
          }
        });
      });
    });
// ── STEP 3: SATURDAY ──────────────────────────
//Saturday = lab block (8-11) + theory slots after
// III BCA Saturday: theory only (no lab), ends with MERN Stack
this.CLASSES.forEach(cls => {
  const year    = this.getYear(cls);
  const labSubjs = (subjectPool[year]||[]).filter(s => s.isLab && !s.isProject);

  if (year === 3) {
    // III BCA Saturday: just theory, no lab
    return; // Step 6 will fill theory slots
  }

  // Year 1 & 2: place one lab block Saturday morning
  if (labSubjs.length === 0) return;
  const block = [0,1,2];
  if (!slotsUsed(cls, 'Sat', block)) return;

  const b1Subjs = labSubjs.filter(s => s.lab_batch === 'B1' || s.lab_batch === 'both');
  const b2Subjs = labSubjs.filter(s => s.lab_batch === 'B2' || s.lab_batch === 'both');
  if (b1Subjs.length === 0) return;

  const b1 = this.rand(b1Subjs);
  const b2 = b2Subjs.length > 0 ? this.rand(b2Subjs) : null;
  const f1 = pickFreeFaculty(b1, 'Sat', 0);
  const f2 = b2 ? pickFreeFaculty(b2, 'Sat', 0) : null;

  markSlots(cls, 'Sat', block, {
    subject:      b1.name,
    facultyId:    f1 ? f1.id   : 'tbd',
    facultyName:  f1 ? f1.name : 'TBD',
    facultyCode:  f1 ? (f1.code || f1.name.split(' ').pop()) : 'TBD',
    room:         pickLabRoom(b1.lab_room_pref),
    type:         'lab',
    batch:        'B1',
    isLocked:     true,
    b2Subject:    b2 ? b2.name : null,
    b2FacultyCode: f2 ? (f2.code||f2.name.split(' ').pop()) : null,
    b2Room:       b2 ? pickLabRoom(b2.lab_room_pref) : null,
    hasB2:        !!b2,
  });
});
// ── STEP 3B: MERN STACK SATURDAY (III BCA) ───
// III BCA Saturday always ends with MERN Stack
this.YEAR3_CLS.forEach(cls => {
  const year = 3;
  const mernSubj = (subjectPool[year]||[]).find(s => 
    s.name.toLowerCase().includes('mern'));
  if (!mernSubj) return;
  // Place at Saturday slot 3 (11:00-12:00)
  if (!schedule[cls]['Sat'][3]) {
    const f = pickFreeFaculty(mernSubj, 'Sat', 3);
    schedule[cls]['Sat'][3] = {
      subject:     mernSubj.name,
      facultyId:   f ? f.id   : 'tbd',
      facultyName: f ? f.name : 'TBD',
      facultyCode: f ? (f.code||f.name.split(' ').pop()) : 'TBD',
      room:        pickRoom(),
      type:        'theory',
      isLocked:    true,
    };
  }
});

    // ── STEP 4: LANGUAGE (K/H/S) ──────────────────
    // K/H/S appears Mon–Fri AND Saturd
    // ALL sections of the year share the SAME slot each time
    // Each section → its own language room (language_room)
    // In reality 3 languages run simultaneously in 3 rooms
    // We schedule the full group as one "language period"
    [1,2,3].forEach(year => {
      if (year === 3) return; // III BCA has no language
      const yearCls  = this.getClassesForYear(year);
      const langSubjs = (subjectPool[year]||[]).filter(s => s.isLang);
      if (langSubjs.length === 0) return;

      // From PDF: language appears ~5 times per week
      // Pick 4–5 different day+slot combos that are free for ALL sections
      const langSlotCount = 4 + Math.floor(Math.random() * 2); // 4 or 5
      let placed = 0;

      const allDays = this.shuffle([...this.WEEKDAYS, 'Sat']);
      for (const day of allDays) {
        if (placed >= langSlotCount) break;
        const slots = this.getSlots(day);
        for (const slot of this.shuffle(slots)) {
          if (placed >= langSlotCount) break;
          // Must be free for ALL sections of this year
          const allFree = yearCls.every(cls => !schedule[cls][day][slot]);
          if (!allFree) continue;

          // Place each section at this slot with their language
          yearCls.forEach((cls, i) => {
            // Cycle K/H/S across sections
            const lang = langSubjs[i % langSubjs.length];
            const f = pickFreeFaculty(lang, day, slot);
            const room = lang.language_room || pickRoom();

            schedule[cls][day][slot] = {
              subject:     lang.name,
              facultyId:   f ? f.id   : 'tbd',
              facultyName: f ? f.name : 'TBD',
              facultyCode: f ? (f.code || f.name.split(' ').pop()) : 'TBD',
              room,
              type:        'language',
              langCode:    lang.language_code || 'K',
              isLocked:    true,
            };
          });
          placed++;
        }
      }
    });

    // ── STEP 5: SHARED LECTURES ───────────────────
    // WP/DA/DS — all II BCA sections at same time, rooms 311/308/316/310B
    // shared_rooms is comma-separated list, one per section
    [1,2,3].forEach(year => {
      const yearCls    = this.getClassesForYear(year);
      const sharedSubjs = (subjectPool[year]||[]).filter(s => s.isShared);
      if (sharedSubjs.length === 0) return;

      sharedSubjs.forEach(subj => {
        const roomList = subj.shared_rooms
          ? subj.shared_rooms.split(',').map(r => r.trim())
          : yearCls.map(() => pickRoom());

       const targetPeriods = subj.periodsPerWeek || 4;
        let placed = 0;

        const allDays = this.shuffle(this.WEEKDAYS);
        for (const day of allDays) {
      if (placed >= targetPeriods) break;
      for (const slot of this.shuffle(this.WORK_SLOTS)) {
        if (placed >= targetPeriods) break;
        const allFree = yearCls.every(cls => !schedule[cls][day][slot]);
        if (!allFree) continue;

        const f = pickFreeFaculty(subj, day, slot);  // ← MOVED HERE ✅

        yearCls.forEach((cls, i) => {
          schedule[cls][day][slot] = {
            subject:     subj.name,
            facultyId:   f ? f.id   : 'tbd',
            facultyName: f ? f.name : 'TBD',
            facultyCode: f ? (f.code || f.name.split(' ').pop()) : 'TBD',
            room:        roomList[i] || pickRoom(),
            type:        'theory',
            isShared:    true,
            isLocked:    true,
          };
        });
    placed++;
  }
}   
      });
    });

    // ── STEP 6: FILL REMAINING WITH THEORY ────────
    // Distribute theory subjects across remaining free slots
    // Rules: no same subject twice on same day, max 2 consecutive
    this.CLASSES.forEach(cls => {
      const year     = this.getYear(cls);
      const subjects = subjectPool[year] || [];
      const theory   = subjects.filter(s => !s.isLab && !s.isLang && !s.isShared);

      const useTheory = theory.length > 0 ? theory
        : this.DEFAULT_SUBJECTS[year]
            .filter(s => !s.isLab && !s.isLang && !s.isShared)
            .map(s => ({ ...s, facultyId:'default', facultyName:'TBD', facultyCode:'TBD' }));

      if (useTheory.length === 0) return;

      this.DAYS.forEach(day => {
        const slots = this.getSlots(day);
        // Track subjects used today for this class
        const usedToday = new Set(
          slots.map(s => schedule[cls][day][s]?.subject).filter(Boolean)
        );

        slots.forEach(slot => {
          if (schedule[cls][day][slot]) return;
          // Saturday: limit theory to 2 subjects max
          if (day === 'Sat') {
            const satCount = this.SAT_SLOTS
              .filter(s => schedule[cls]['Sat'][s]?.type === 'theory').length;
            if (satCount >= 2) return;
  }

          // Pick a theory subject not already used today
         const available = useTheory.filter(s => !usedToday.has(s.name));
         const pool = available.length > 0 ? available : useTheory;
         const subj = this.rand(pool);

          // Prefer faculty with fewer assignments today to reduce clashes
          const facultyLoad = {};
          this.CLASSES.forEach(c => {
         this.getSlots(day).forEach(s => {
          const g = schedule[c]?.[day]?.[s];
          if (g?.facultyId) facultyLoad[g.facultyId] = (facultyLoad[g.facultyId] || 0) + 1;
         });
              });
            // Find who is already teaching at this slot across ALL classes
            const busyFacultyAtSlot = new Set();
            this.CLASSES.forEach(c => {
          const g = schedule[c]?.[day]?.[slot];
           if (g?.facultyId) busyFacultyAtSlot.add(String(g.facultyId));
        });

        // Prefer the subject's real faculty if they're free
        const subjectFaculty = activeFaculty.find(fac => String(fac.id) === String(subj.facultyId));
        let f;
          if (subjectFaculty && !busyFacultyAtSlot.has(String(subjectFaculty.id))) {
         f = subjectFaculty; // ✅ correct faculty and free
      } else {
        // Pick any faculty who is free at this slot
      const freeFaculty = activeFaculty.filter(fac => !busyFacultyAtSlot.has(String(fac.id)));
      f = freeFaculty.length > 0 ? this.rand(freeFaculty) : this.rand(activeFaculty);
      }

          const room = pickRoom();

          schedule[cls][day][slot] = {
            subject:     subj.name,
            facultyId:   f ? f.id   : 'tbd',
            facultyName: f ? f.name : 'TBD',
            facultyCode: f ? (f.code || f.name.split(' ').pop()) : 'TBD',
            room,
            type:        'theory',
          };
          usedToday.add(subj.name);
        });
      });
    });

    return schedule;
  },

  // ════════════════════════════════════════════════
  // FITNESS FUNCTION
  // Penalties modelled after real BMS constraints
  // ════════════════════════════════════════════════
  fitness(schedule, labs) {
    let penalty = 0;
    const violations = {
      facultyClash:  0,
      subjectRepeat: 0,
      consecutive:   0,
      blockedSlot:   0,
      unbalanced:    0,
      labBlock:      0,
      langSync:      0,
    };

   // 1. Faculty double-booking — skip language (they teach multiple classes same slot by design)
      this.DAYS.forEach(day => {
        this.getSlots(day).forEach(slot => {
          const seen = {};
          this.CLASSES.forEach(cls => {
            const g = schedule[cls]?.[day]?.[slot];
           // Language AND project faculty teaching same slot is valid
            if (g?.type === 'language' || g?.type === 'project') return;
            if (g?.facultyId && g.facultyId !== 'tbd' && g.facultyId !== 'default') {
              if (seen[g.facultyId]) { penalty += 40; violations.facultyClash++; }
              seen[g.facultyId] = true;
            }
          });
        });
      });

    // 2. Same theory subject twice on same day for same class
    this.CLASSES.forEach(cls => {
      this.DAYS.forEach(day => {
        const seen = {};
        this.getSlots(day).forEach(slot => {
          const g = schedule[cls]?.[day]?.[slot];
          if (g?.subject && g.type !== 'lab' && g.type !== 'project' && g.type !== 'language') {
            if (seen[g.subject]) { penalty += 15; violations.subjectRepeat++; }
            seen[g.subject] = true;
          }
        });
      });
    });

    // 3. More than 2 consecutive same-theory-subject periods
    this.CLASSES.forEach(cls => {
      this.DAYS.forEach(day => {
        const slots = this.getSlots(day);
        let streak = 1;
        for (let i = 1; i < slots.length; i++) {
          const prev = schedule[cls]?.[day]?.[slots[i-1]];
          const curr = schedule[cls]?.[day]?.[slots[i]];
          if (prev?.subject && curr?.subject
              && prev.subject === curr.subject
              && prev.type === 'theory' && curr.type === 'theory') {
            streak++;
            if (streak > 2) { penalty += 12; violations.consecutive++; }
          } else { streak = 1; }
        }
      });
    });

    // 4. Blocked slots for shared labs
    const sharedLabs = (labs||[]).filter(l => l.labtype === 'shared' && l.blockedSlots?.length > 0);
    sharedLabs.forEach(lab => {
      (lab.blockedSlots||[]).forEach(key => {
        const [day, ...rest] = key.split('_');
        const slotLabel = rest.join('_');
        const slotIndex = this.SLOT_LABELS.indexOf(slotLabel);
        if (slotIndex < 0) return;
        this.CLASSES.forEach(cls => {
          const g = schedule[cls]?.[day]?.[slotIndex];
          if (g?.room === lab.name) { penalty += 25; violations.blockedSlot++; }
        });
      });
    });

    // 5. Subject spread — avoid same subject 5+ days/week
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

    // 6. Lab must be part of a valid 3-hour block
    this.CLASSES.forEach(cls => {
      this.DAYS.forEach(day => {
        this.getSlots(day).forEach(slot => {
          const g = schedule[cls]?.[day]?.[slot];
          if (g?.type === 'lab' || g?.type === 'project') {
            const validBlocks = this.getLabBlocks(day);
            const inBlock = validBlocks.some(b => b.includes(slot));
            if (!inBlock) { penalty += 25; violations.labBlock++; }
          }
        });
      });
    });

    // 7. Language sync — all sections of same year must have same lang slot
    [1,2,3].forEach(year => {
      if (year === 3) return;
      const yearCls = this.getClassesForYear(year);
      this.DAYS.forEach(day => {
        this.getSlots(day).forEach(slot => {
          const langCount = yearCls
            .filter(cls => schedule[cls]?.[day]?.[slot]?.type === 'language').length;
          // Some but not all sections have language here → penalty
          if (langCount > 0 && langCount < yearCls.length) {
            penalty += 10 * (yearCls.length - langCount);
            violations.langSync++;
          }
        });
      });
    });

    const score = Math.max(0, Math.min(100, 100 - (penalty / 4000) * 100));
    console.log('Penalty:', penalty, 'Violations:', violations);  
    return { score: parseFloat(score.toFixed(2)), penalty, violations };
  },

  // ── SELECTION (tournament k=3) ────────────────
  select(population, scores) {
    let best = null, bestScore = -1;
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * population.length);
      if (scores[idx] > bestScore) { bestScore = scores[idx]; best = population[idx]; }
    }
    return best;
  },

  crossover(p1, p2) {
  const child = {};
  // Group by year to avoid mixing faculty assignments across years
  const yearGroups = [
    ['I_A','I_B'],
    ['II_A','II_B','II_C','II_D'],
    ['III_A','III_B','III_C']
  ];
  yearGroups.forEach(group => {
    // Take entire year from one parent — keeps faculty assignments consistent
    const src = Math.random() < 0.5 ? p1 : p2;
    group.forEach(cls => {
      child[cls] = JSON.parse(JSON.stringify(src[cls]));
    });
  });
  return child;
},

  // ── MUTATION (theory slots only — NEVER locked) ─
  mutate(schedule, faculty, rooms, labs, subjectPool, rate) {
    const activeFaculty = faculty.filter(f => f.active == 1 || f.active === true);
    const availRooms    = rooms.filter(r => r.available == 1 || r.available === true);
    const pickRoom = () => availRooms.length > 0 ? this.rand(availRooms).name : 'TBD';

    this.CLASSES.forEach(cls => {
      const year = this.getYear(cls);
      const theory = (subjectPool[year]||[]).filter(s => !s.isLab && !s.isLang && !s.isShared);

      this.DAYS.forEach(day => {
        this.getSlots(day).forEach(slot => {
          if (Math.random() >= rate) return;
          const existing = schedule[cls]?.[day]?.[slot];
          // Never mutate locked cells (labs, language, shared, project)
          if (!existing || existing.isLocked || existing.type !== 'theory') return;
          if (theory.length === 0 || activeFaculty.length === 0) return;

          // Pick subject not already used today for this class
          const usedToday = new Set(
            this.getSlots(day)
              .map(s => schedule[cls]?.[day]?.[s]?.subject)
              .filter(Boolean)
          );
          const available = theory.filter(s => !usedToday.has(s.name));
          const subj = this.rand(theory);
          const busyAtSlot = new Set();
          this.CLASSES.forEach(c => {
            const g = schedule[c]?.[day]?.[slot];
            if (g?.facultyId && g?.type !== 'language' && g?.type !== 'project') 
              busyAtSlot.add(String(g.facultyId));
          });
          const preferred = activeFaculty.find(f => String(f.id) === String(subj.facultyId));
          const freeFaculty = activeFaculty.filter(f => !busyAtSlot.has(String(f.id)));
          const f = (preferred && !busyAtSlot.has(String(preferred.id)))
            ? preferred
            : freeFaculty.length > 0 ? this.rand(freeFaculty) : this.rand(activeFaculty);
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

  // ════════════════════════════════════════════════
  // MAIN GA RUN
  // ════════════════════════════════════════════════
  run({ faculty, rooms, labs, allSubjects,
        populationSize = 50, maxGenerations = 200,
        mutationRate   = 0.05, elitismPct    = 0.10,
        targetFitness  = 95,
        onGeneration   = () => {},
        onComplete     = () => {} }) {

    const subjectPool = (allSubjects && allSubjects.length > 0)
      ? this.buildSubjectPoolFromDB(allSubjects, faculty)
      : this.buildSubjectPool(faculty);

    console.log('GA v3 Subject pool:', {
      yr1: subjectPool[1].map(s => `${s.name}${s.lab_batch?'['+s.lab_batch+']':''}${s.isLang?'[LANG]':''}${s.isShared?'[SHARED]':''}`),
      yr2: subjectPool[2].map(s => `${s.name}${s.lab_batch?'['+s.lab_batch+']':''}${s.isLang?'[LANG]':''}${s.isShared?'[SHARED]':''}`),
      yr3: subjectPool[3].map(s => `${s.name}${s.lab_batch?'['+s.lab_batch+']':''}${s.isLang?'[LANG]':''}${s.isShared?'[SHARED]':''}`),
    });

    let population = Array.from({ length: populationSize }, () =>
      this.createChromosome(faculty, rooms, labs, subjectPool)
    );

    let gen = 0;
    let bestSchedule = null, bestScore = -1, bestViolations = {};
    const eliteCount = Math.max(1, Math.floor(populationSize * 0.30));
    
    const step = () => {
      try {
        gen++;
        const evaluated = population.map(sched => {
          const { score, penalty, violations } = this.fitness(sched, labs);
          return { schedule:sched, score, penalty, violations };
        });
        evaluated.sort((a,b) => b.score - a.score);

        if (evaluated[0].score >= bestScore) {
          bestScore      = evaluated[0].score;
          bestSchedule   = evaluated[0].schedule;
          bestViolations = evaluated[0].violations;
        }

        onGeneration({
          gen, bestScore,
          avgScore:   evaluated.reduce((s,e) => s + e.score, 0) / evaluated.length,
          violations: bestViolations,
          penalty:    evaluated[0].penalty,
        });

        if (gen >= maxGenerations || bestScore >= targetFitness) {
          onComplete({ schedule:bestSchedule, score:bestScore, gen, violations:bestViolations });
          return;
        }

        const scores    = evaluated.map(e => e.score);
        const schedules = evaluated.map(e => e.schedule);
        const nextGen   = schedules.slice(0, eliteCount)
                                   .map(s => JSON.parse(JSON.stringify(s)));

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

      } catch(err) {
        console.error('GA v3 crashed at gen', gen, ':', err);
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
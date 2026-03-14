// ════════════════════════════════════════════════
// TIMETRIX — REAL GENETIC ALGORITHM ENGINE
// BMS College for Women — BCA Department
// ════════════════════════════════════════════════

const GA = {

  CLASSES: ['I_A','I_B','II_A','II_B','II_C','II_D','III_A','III_B','III_C'],

  DAYS: ['Mon','Tue','Wed','Thu','Fri','Sat'],

  SLOT_LABELS: [
    '8:00-9:00','9:00-10:00','10:00-11:00','11:00-12:00',
    'LUNCH',
    '1:00-2:00','2:00-3:00','3:00-4:00','4:00-5:00'
  ],

  WORK_SLOTS: [0,1,2,3,5,6,7,8],
  SAT_SLOTS:  [0,1,2,3],
  LAB_BLOCKS: [[0,1,2],[5,6,7],[6,7,8]],

  DEFAULT_SUBJECTS: {
    1: ['C Programming','Data Structures','Mathematics','English','Kannada','Web Design Lab','Environmental Science'],
    2: ['DBMS','Java Programming','Operating Systems','Software Engineering','Mathematics','DBMS Lab','Java Lab'],
    3: ['Python','Artificial Intelligence','Computer Networks','Software Testing','Project Lab','CN Lab','Python Lab']
  },

  getYear(cls) {
    if (cls.startsWith('III')) return 3;
    if (cls.startsWith('II_')) return 2;
    return 1;
  },

  getSlots(day) {
    return day === 'Sat' ? this.SAT_SLOTS : this.WORK_SLOTS;
  },

  isLabSubject(name) {
    return name && name.toLowerCase().includes('lab');
  },

  isLangSubject(name) {
    if (!name) return false;
    const n = name.toLowerCase();
    return ['kannada','hindi','sanskrit','english'].some(l => n.includes(l));
  },

  rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  buildSubjectPool(faculty) {
    const pool = { 1:[], 2:[], 3:[] };

    faculty.forEach(f => {
      (f.subjects || []).forEach(sub => {
        [1,2,3].forEach(y => {
          if (!pool[y].find(s => s.name === sub)) {
            pool[y].push({
              name:        sub,
              isLab:       this.isLabSubject(sub),
              isLang:      this.isLangSubject(sub),
              facultyId:   f.id,
              facultyName: f.name,
              facultyCode: f.code || f.name.split(' ').slice(-1)[0]
            });
          }
        });
      });
    });

    [1,2,3].forEach(y => {
      if (pool[y].length === 0) {
        pool[y] = this.DEFAULT_SUBJECTS[y].map(name => ({
          name,
          isLab:       this.isLabSubject(name),
          isLang:      this.isLangSubject(name),
          facultyId:   'default',
          facultyName: 'TBD',
          facultyCode: 'TBD'
        }));
      }
    });

    return pool;
  },

  createChromosome(faculty, rooms, labs, subjectPool) {
    const schedule      = {};
    const activeFaculty = faculty.filter(f => f.active !== false);
    const availRooms    = rooms.filter(r => r.available !== false);
    const availLabs     = labs.filter(l => l.available !== false);

    this.CLASSES.forEach(cls => {
      schedule[cls] = {};
      const year           = this.getYear(cls);
      const subjects       = subjectPool[year];
      const theorySubjects = subjects.filter(s => !s.isLab);
      const labSubjects    = subjects.filter(s => s.isLab);

      this.DAYS.forEach(day => {
        schedule[cls][day] = {};
        const slots = this.getSlots(day);

        let labSlots = [];
        if (day !== 'Sat' && labSubjects.length > 0 && Math.random() < 0.35) {
          labSlots = this.rand(this.LAB_BLOCKS);
        }

        slots.forEach(slot => {
          const isLabSlot = labSlots.includes(slot);

          if (isLabSlot && labSubjects.length > 0) {
            const subj = this.rand(labSubjects);
            const lab  = availLabs.length > 0 ? this.rand(availLabs) : null;
            const f    = activeFaculty.find(f => f.id === subj.facultyId) ||
                         (activeFaculty.length > 0 ? this.rand(activeFaculty) : null);

            schedule[cls][day][slot] = {
              subject:     subj.name,
              facultyId:   f ? f.id   : 'tbd',
              facultyName: f ? f.name : 'TBD',
              facultyCode: f ? (f.code || f.name.split(' ').slice(-1)[0]) : 'TBD',
              room:        lab ? lab.name : (availRooms.length > 0 ? this.rand(availRooms).name : 'Lab'),
              type:        'lab',
              batch:       Math.random() < 0.5 ? 'B1' : 'B2'
            };

          } else if (theorySubjects.length > 0) {
            const subj = this.rand(theorySubjects);
            const f    = activeFaculty.find(f => f.id === subj.facultyId) ||
                         (activeFaculty.length > 0 ? this.rand(activeFaculty) : null);
            const room = availRooms.length > 0 ? this.rand(availRooms) : null;

            schedule[cls][day][slot] = {
              subject:     subj.name,
              facultyId:   f ? f.id   : 'tbd',
              facultyName: f ? f.name : 'TBD',
              facultyCode: f ? (f.code || f.name.split(' ').slice(-1)[0]) : 'TBD',
              room:        room ? room.name : 'TBD',
              type:        subj.isLang ? 'lang' : 'theory'
            };
          }
        });
      });
    });

    return schedule;
  },

  fitness(schedule, labs) {
    let penalty = 0;
    const violations = {
      facultyClash:  0,
      subjectRepeat: 0,
      consecutive:   0,
      blockedSlot:   0,
      unbalanced:    0
    };

    // 1. Faculty double-booked
    this.DAYS.forEach(day => {
      this.getSlots(day).forEach(slot => {
        const seen = {};
        this.CLASSES.forEach(cls => {
          const g = schedule[cls]?.[day]?.[slot];
          if (g?.facultyId && g.facultyId !== 'tbd' && g.facultyId !== 'default') {
            if (seen[g.facultyId]) {
              penalty += 25;
              violations.facultyClash++;
            }
            seen[g.facultyId] = true;
          }
        });
      });
    });

    // 2. Same subject more than once per class per day
    this.CLASSES.forEach(cls => {
      this.DAYS.forEach(day => {
        const seen = {};
        this.getSlots(day).forEach(slot => {
          const g = schedule[cls]?.[day]?.[slot];
          if (g?.subject) {
            if (seen[g.subject]) {
              penalty += 15;
              violations.subjectRepeat++;
            }
            seen[g.subject] = true;
          }
        });
      });
    });

    // 3. More than 2 consecutive same subject
    this.CLASSES.forEach(cls => {
      this.DAYS.forEach(day => {
        const slots = this.getSlots(day);
        let count = 1;
        for (let i = 1; i < slots.length; i++) {
          const prev = schedule[cls]?.[day]?.[slots[i-1]];
          const curr = schedule[cls]?.[day]?.[slots[i]];
          if (prev?.subject && curr?.subject && prev.subject === curr.subject) {
            count++;
            if (count > 2) { penalty += 10; violations.consecutive++; }
          } else {
            count = 1;
          }
        }
      });
    });

    // 4. Blocked lab slots used by BCA
    const sharedLabs = (labs || []).filter(l => l.labtype === 'shared' && l.blockedSlots?.length > 0);
    sharedLabs.forEach(lab => {
      (lab.blockedSlots || []).forEach(key => {
        const parts    = key.split('_');
        const day      = parts[0];
        const slotLabel= parts.slice(1).join('_');
        const slotIndex= this.SLOT_LABELS.indexOf(slotLabel);
        if (slotIndex < 0) return;
        this.CLASSES.forEach(cls => {
          const g = schedule[cls]?.[day]?.[slotIndex];
          if (g?.room === lab.name) {
            penalty += 20;
            violations.blockedSlot++;
          }
        });
      });
    });

    // 5. Subject appearing 5+ days (unbalanced)
    this.CLASSES.forEach(cls => {
      const subjectDays = {};
      this.DAYS.forEach(day => {
        this.getSlots(day).forEach(slot => {
          const g = schedule[cls]?.[day]?.[slot];
          if (g?.subject) {
            if (!subjectDays[g.subject]) subjectDays[g.subject] = new Set();
            subjectDays[g.subject].add(day);
          }
        });
      });
      Object.values(subjectDays).forEach(days => {
        if (days.size >= 5) { penalty += 10; violations.unbalanced++; }
      });
    });

    const score = Math.max(0, Math.min(100, 100 - (penalty / 800) * 100));
    return { score: parseFloat(score.toFixed(2)), penalty, violations };
  },

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
    this.CLASSES.forEach(cls => {
      child[cls] = Math.random() < 0.5
        ? JSON.parse(JSON.stringify(p1[cls]))
        : JSON.parse(JSON.stringify(p2[cls]));
    });
    return child;
  },

  mutate(schedule, faculty, rooms, labs, subjectPool, rate) {
    const activeFaculty = faculty.filter(f => f.active !== false);
    const availRooms    = rooms.filter(r => r.available !== false);

    this.CLASSES.forEach(cls => {
      const year           = this.getYear(cls);
      const theorySubjects = subjectPool[year].filter(s => !s.isLab);

      this.DAYS.forEach(day => {
        this.getSlots(day).forEach(slot => {
          if (Math.random() < rate && theorySubjects.length > 0 && activeFaculty.length > 0) {
            const subj = this.rand(theorySubjects);
            const f    = activeFaculty.find(f => f.id === subj.facultyId) || this.rand(activeFaculty);
            const room = availRooms.length > 0 ? this.rand(availRooms) : null;
            schedule[cls][day][slot] = {
              subject:     subj.name,
              facultyId:   f.id,
              facultyName: f.name,
              facultyCode: f.code || f.name.split(' ').slice(-1)[0],
              room:        room ? room.name : 'TBD',
              type:        subj.isLang ? 'lang' : 'theory'
            };
          }
        });
      });
    });
    return schedule;
  },

  run({ faculty, rooms, labs, populationSize=50, maxGenerations=200,
        mutationRate=0.05, elitismPct=0.10, targetFitness=95,
        onGeneration=()=>{}, onComplete=()=>{} }) {

    const subjectPool = this.buildSubjectPool(faculty);
    let population    = Array.from({ length: populationSize }, () =>
      this.createChromosome(faculty, rooms, labs, subjectPool)
    );

    let gen=0, bestSchedule=null, bestScore=0, bestViolations={};
    const eliteCount = Math.max(1, Math.floor(populationSize * elitismPct));

    const step = () => {
      gen++;

      const evaluated = population.map(schedule => {
        const { score, penalty, violations } = this.fitness(schedule, labs);
        return { schedule, score, penalty, violations };
      });
      evaluated.sort((a,b) => b.score - a.score);

      if (evaluated[0].score > bestScore) {
        bestScore      = evaluated[0].score;
        bestSchedule   = evaluated[0].schedule;
        bestViolations = evaluated[0].violations;
      }

      onGeneration({
        gen, bestScore,
        avgScore:   evaluated.reduce((s,e)=>s+e.score,0) / evaluated.length,
        violations: bestViolations,
        penalty:    evaluated[0].penalty
      });

      if (gen >= maxGenerations || bestScore >= targetFitness) {
        onComplete({ schedule: bestSchedule, score: bestScore, gen, violations: bestViolations });
        return;
      }

      const scores    = evaluated.map(e => e.score);
      const schedules = evaluated.map(e => e.schedule);
      const nextGen   = schedules.slice(0, eliteCount).map(s => JSON.parse(JSON.stringify(s)));

      while (nextGen.length < populationSize) {
        let child = this.crossover(this.select(schedules,scores), this.select(schedules,scores));
        child = this.mutate(child, faculty, rooms, labs, subjectPool, mutationRate);
        nextGen.push(child);
      }

      population = nextGen;
      setTimeout(step, 0);
    };

    setTimeout(step, 0);
  }
};
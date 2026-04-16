const fs = require('fs');
const path = require('path');
const https = require('https');

const EX_DIR = path.join(__dirname, '../public/ex');
if (!fs.existsSync(EX_DIR)) fs.mkdirSync(EX_DIR, { recursive: true });

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '122711d725mshfa4bd64e457d1cep1ea5c0jsn8bb4cd25aa6a';

const EXERCISE_NAMES = [
  'Bench Press (Barbell)','Bench Press (Dumbbell)','Incline Bench Press (Barbell)',
  'Incline Bench Press (Dumbbell)','Decline Bench Press (Barbell)','Chest Fly (Dumbbell)',
  'Cable Crossover','Pec Deck Fly','Chest Dip','Pull Over (Dumbbell)',
  'Cable Fly (High to Low)','Cable Fly (Low to High)','Chest Press (Machine)',
  'Deadlift (Barbell)','Romanian Deadlift (Barbell)','Sumo Deadlift',
  'Pull Up (Overhand)','Pull Up (Underhand)','Pull Up (Neutral Grip)',
  'Barbell Row (Overhand)','One-Arm Dumbbell Row','Lat Pulldown (Wide Grip)',
  'Lat Pulldown (Narrow Grip)','Seated Row (Cable)','Back Extension',
  'Face Pull','Shrug (Barbell)','Good Morning (Barbell)','T-Bar Row','Rack Pull',
  'Overhead Press (Barbell)','Seated Overhead Press (Barbell)','Seated Dumbbell Press',
  'Arnold Press','Lateral Raise (Dumbbell)','Front Raise (Dumbbell)',
  'Reverse Fly (Dumbbell)','Shoulder Press (Machine)','Upright Row (Barbell)',
  'Cable Lateral Raise','Barbell Curl','EZ Bar Curl','Alternating Dumbbell Curl',
  'Hammer Curl (Dumbbell)','Concentration Curl','Preacher Curl (Barbell)',
  'Cable Curl','Incline Dumbbell Curl','Spider Curl','Reverse Curl (Barbell)',
  'Skull Crusher (Barbell)','Skull Crusher (EZ Bar)','Tricep Pushdown (Rope)',
  'Tricep Pushdown (Bar)','Bench Dip','Close Grip Bench Press',
  'Tricep Kickback (Dumbbell)','Overhead Extension (Dumbbell)','Diamond Push Up',
  'Squat (Barbell)','Front Squat (Barbell)','Bulgarian Split Squat (Dumbbell)',
  'Leg Press','Hack Squat (Machine)','Leg Extension (Machine)',
  'Lying Leg Curl (Machine)','Seated Leg Curl (Machine)','Hip Thrust (Barbell)',
  'Walking Lunge (Dumbbell)','Standing Calf Raise (Machine)',
  'Seated Calf Raise (Plate Loaded)','Hip Adductor (Machine)','Hip Abductor (Machine)',
  'Romanian Deadlift (Dumbbell)','Glute Kickback (Cable)','Step Up (Dumbbell)',
  'Goblet Squat','Crunch','Cable Crunch','Plank','Hanging Leg Raise',
  'Ab Rollout','Russian Twist (Plate)','Hanging Knee Raise','Bicycle Crunch',
  'Leg Raise (Flat Bench)','Mountain Climber','Dragon Flag','Decline Crunch',
];

function toFilename(nombre) {
  return nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.gif';
}

function toSearchTerm(nombre) {
  return nombre.toLowerCase()
    .replace(/\(barbell\)/g,'barbell').replace(/\(dumbbell\)/g,'dumbbell')
    .replace(/\(machine\)/g,'machine').replace(/\(cable\)/g,'cable')
    .replace(/\(rope\)/g,'rope').replace(/\(bar\)/g,'bar')
    .replace(/\(ez bar\)/g,'ez bar').replace(/\(overhand\)/g,'')
    .replace(/\(underhand\)/g,'').replace(/\(neutral grip\)/g,'')
    .replace(/\(wide grip\)/g,'wide grip').replace(/\(narrow grip\)/g,'narrow grip')
    .replace(/\(plate loaded\)/g,'').replace(/[()]/g,'').trim();
}

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const req = https.get({
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers,
        timeout: 15000
      }, res => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return httpsGet(res.headers.location, headers).then(resolve).catch(reject);
        }
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    } catch(e) { reject(e); }
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) { resolve(true); return; }
    try {
      const urlObj = new URL(url);
      const file = fs.createWriteStream(dest);
      const req = https.get({ hostname: urlObj.hostname, path: urlObj.pathname + urlObj.search, timeout: 20000 }, res => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          downloadFile(res.headers.location, dest).then(resolve);
          return;
        }
        if (res.statusCode !== 200) { file.close(); try{fs.unlinkSync(dest);}catch(e){} resolve(false); return; }
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
      });
      req.on('error', () => { file.close(); try{fs.unlinkSync(dest);}catch(e){} resolve(false); });
      req.on('timeout', () => { req.destroy(); resolve(false); });
    } catch(e) { resolve(false); }
  });
}

async function searchExercise(name) {
  const term = toSearchTerm(name);
  const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(term)}?limit=3&offset=0`;
  try {
    const res = await httpsGet(url, {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
    });
    if (res.status !== 200) return null;
    const data = JSON.parse(res.body);
    if (!data || !data.length) return null;
    return data[0].gifUrl || null;
  } catch(e) { return null; }
}

async function downloadAll() {
  let ok = 0, skip = 0, fail = 0;
  console.log(`Downloading ${EXERCISE_NAMES.length} exercise GIFs from ExerciseDB...`);

  for (const nombre of EXERCISE_NAMES) {
    const dest = path.join(EX_DIR, toFilename(nombre));
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) { skip++; continue; }

    const gifUrl = await searchExercise(nombre);
    if (!gifUrl) { console.log(`✗ Not found: ${nombre}`); fail++; await new Promise(r=>setTimeout(r,200)); continue; }

    const success = await downloadFile(gifUrl, dest);
    if (success) { console.log(`✓ ${nombre}`); ok++; }
    else { console.log(`✗ Failed: ${nombre}`); fail++; }

    await new Promise(r => setTimeout(r, 350));
  }

  console.log(`\nDone: ${ok} downloaded, ${skip} cached, ${fail} failed`);
  return { ok, skip, fail };
}

module.exports = { downloadAll, EX_DIR };
if (require.main === module) downloadAll();

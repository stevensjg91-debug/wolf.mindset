const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const EX_DIR = path.join(__dirname, '../public/ex');
if (!fs.existsSync(EX_DIR)) fs.mkdirSync(EX_DIR, { recursive: true });

// Direct mapping: exercise name -> ExerciseDB exercise ID
// ExerciseDB GIFs: https://exercisedb-api.vercel.app (free, no key needed)
const EXERCISE_MAP = {
  // CHEST
  'Bench Press (Barbell)': 'barbell-bench-press-medium-grip',
  'Bench Press (Dumbbell)': 'dumbbell-bench-press',
  'Incline Bench Press (Barbell)': 'barbell-incline-bench-press-medium-grip',
  'Incline Bench Press (Dumbbell)': 'dumbbell-incline-bench-press',
  'Decline Bench Press (Barbell)': 'barbell-decline-bench-press',
  'Chest Fly (Dumbbell)': 'dumbbell-flyes',
  'Cable Crossover': 'cable-cross-over',
  'Pec Deck Fly': 'butterfly',
  'Chest Dip': 'chest-dip',
  'Pull Over (Dumbbell)': 'dumbbell-pullover',
  'Cable Fly (High to Low)': 'cable-high-fly',
  'Cable Fly (Low to High)': 'cable-low-fly',
  'Chest Press (Machine)': 'machine-chest-press',
  // BACK
  'Deadlift (Barbell)': 'barbell-deadlift',
  'Romanian Deadlift (Barbell)': 'romanian-deadlift',
  'Sumo Deadlift': 'sumo-deadlift',
  'Pull Up (Overhand)': 'pull-up',
  'Pull Up (Underhand)': 'chin-up',
  'Pull Up (Neutral Grip)': 'neutral-grip-pull-up',
  'Barbell Row (Overhand)': 'bent-over-barbell-row',
  'One-Arm Dumbbell Row': 'one-arm-dumbbell-row',
  'Lat Pulldown (Wide Grip)': 'wide-grip-lat-pulldown',
  'Lat Pulldown (Narrow Grip)': 'close-grip-lat-pulldown',
  'Seated Row (Cable)': 'seated-cable-rows',
  'Back Extension': 'hyperextensions-back-extensions',
  'Face Pull': 'face-pull',
  'Shrug (Barbell)': 'barbell-shrug',
  'Good Morning (Barbell)': 'good-morning',
  'T-Bar Row': 't-bar-row-with-handle',
  'Rack Pull': 'rack-pull',
  // SHOULDERS
  'Overhead Press (Barbell)': 'barbell-shoulder-press',
  'Seated Overhead Press (Barbell)': 'seated-barbell-military-press',
  'Seated Dumbbell Press': 'seated-dumbbell-press',
  'Arnold Press': 'arnold-dumbbell-press',
  'Lateral Raise (Dumbbell)': 'side-lateral-raise',
  'Front Raise (Dumbbell)': 'dumbbell-front-raise',
  'Reverse Fly (Dumbbell)': 'bent-over-dumbbell-rear-delt-raise-with-head-on-bench',
  'Shoulder Press (Machine)': 'machine-shoulder-press',
  'Upright Row (Barbell)': 'barbell-upright-row',
  'Cable Lateral Raise': 'cable-lateral-raise',
  // BICEPS
  'Barbell Curl': 'barbell-curl',
  'EZ Bar Curl': 'ez-bar-curl',
  'Alternating Dumbbell Curl': 'dumbbell-alternate-bicep-curl',
  'Hammer Curl (Dumbbell)': 'hammer-curls',
  'Concentration Curl': 'concentration-curls',
  'Preacher Curl (Barbell)': 'barbell-preacher-curl',
  'Cable Curl': 'cable-hammer-curl-rope-attachment',
  'Incline Dumbbell Curl': 'incline-hammer-curls',
  'Spider Curl': 'spider-curl',
  'Reverse Curl (Barbell)': 'barbell-reverse-curl',
  // TRICEPS
  'Skull Crusher (Barbell)': 'barbell-lying-triceps-extension-skull-crushers',
  'Skull Crusher (EZ Bar)': 'ez-bar-lying-triceps-extension',
  'Tricep Pushdown (Rope)': 'triceps-pushdown-rope-attachment',
  'Tricep Pushdown (Bar)': 'tricep-pushdown',
  'Bench Dip': 'bench-dips',
  'Close Grip Bench Press': 'close-grip-barbell-bench-press',
  'Tricep Kickback (Dumbbell)': 'dumbbell-kickback',
  'Overhead Extension (Dumbbell)': 'dumbbell-one-arm-triceps-extension',
  'Diamond Push Up': 'diamond-push-up',
  // LEGS
  'Squat (Barbell)': 'barbell-full-squat',
  'Front Squat (Barbell)': 'barbell-front-squat',
  'Bulgarian Split Squat (Dumbbell)': 'dumbbell-bulgarian-split-squat',
  'Leg Press': 'leg-press',
  'Hack Squat (Machine)': 'hack-squat',
  'Leg Extension (Machine)': 'leg-extensions',
  'Lying Leg Curl (Machine)': 'lying-hamstring-curl-with-dumbbell',
  'Seated Leg Curl (Machine)': 'seated-leg-curl',
  'Hip Thrust (Barbell)': 'barbell-hip-thrust',
  'Walking Lunge (Dumbbell)': 'dumbbell-lunges',
  'Standing Calf Raise (Machine)': 'standing-calf-raises',
  'Seated Calf Raise (Plate Loaded)': 'seated-calf-raise',
  'Hip Adductor (Machine)': 'adductor',
  'Hip Abductor (Machine)': 'abductor',
  'Romanian Deadlift (Dumbbell)': 'dumbbell-romanian-deadlift',
  'Glute Kickback (Cable)': 'cable-hip-extension',
  'Step Up (Dumbbell)': 'dumbbell-step-ups',
  'Goblet Squat': 'dumbbell-goblet-squat',
  // ABS
  'Crunch': 'crunch',
  'Cable Crunch': 'cable-crunch',
  'Plank': 'plank',
  'Hanging Leg Raise': 'hanging-leg-raise',
  'Ab Rollout': 'ab-roller',
  'Russian Twist (Plate)': 'russian-twist',
  'Hanging Knee Raise': 'hanging-leg-hip-raise',
  'Bicycle Crunch': 'bicycle-crunch',
  'Leg Raise (Flat Bench)': 'flat-bench-leg-pull-in',
  'Mountain Climber': 'mountain-climbers',
  'Dragon Flag': 'dragon-flag',
  'Decline Crunch': 'decline-crunch',
};

function get(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { timeout: 8000 }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, data: Buffer.concat(chunks), headers: res.headers }));
    }).on('error', reject).on('timeout', () => reject(new Error('timeout')));
  });
}

async function downloadAll() {
  const total = Object.keys(EXERCISE_MAP).length;
  let ok = 0, skip = 0, fail = 0;

  for (const [exName, exId] of Object.entries(EXERCISE_MAP)) {
    const safeName = exName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const dest = path.join(EX_DIR, safeName + '.gif');

    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      skip++; continue;
    }

    try {
      // ExerciseDB API - free, no key
      const apiUrl = `https://exercisedb-api.vercel.app/api/v1/exercises/name/${encodeURIComponent(exId)}`;
      const res = await get(apiUrl);
      if (res.status === 200) {
        const json = JSON.parse(res.data.toString());
        const exercises = json.data || json;
        if (exercises && exercises.length > 0 && exercises[0].gifUrl) {
          const gifRes = await get(exercises[0].gifUrl);
          if (gifRes.status === 200 && gifRes.data.length > 1000) {
            fs.writeFileSync(dest, gifRes.data);
            ok++;
            console.log(`✓ ${exName}`);
            await new Promise(r => setTimeout(r, 150));
            continue;
          }
        }
      }
    } catch(e) {}

    // Fallback: try direct exercisedb CDN
    try {
      const cdnUrl = `https://exercisedb.io/image/${exId}`;
      const res = await get(cdnUrl);
      if (res.status === 200 && res.data.length > 1000) {
        fs.writeFileSync(dest, res.data);
        ok++;
        console.log(`✓ ${exName} (cdn)`);
        await new Promise(r => setTimeout(r, 100));
        continue;
      }
    } catch(e) {}

    fail++;
    console.log(`✗ ${exName}`);
  }

  console.log(`\nImages: ${ok} downloaded, ${skip} cached, ${fail} failed of ${total}`);
  return { ok, skip, fail };
}

// Also export the name->filename mapping for frontend use
const NAME_TO_FILE = {};
Object.keys(EXERCISE_MAP).forEach(name => {
  NAME_TO_FILE[name] = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.gif';
});

module.exports = { downloadAll, EX_DIR, NAME_TO_FILE };

if (require.main === module) downloadAll();

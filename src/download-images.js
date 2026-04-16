const fs = require('fs');
const path = require('path');
const https = require('https');

const EX_DIR = path.join(__dirname, '../public/ex');
if (!fs.existsSync(EX_DIR)) fs.mkdirSync(EX_DIR, { recursive: true });

// Map: our filename -> free-exercise-db folder name
const EXERCISE_MAP = {
  'bench-press-barbell': 'Barbell_Bench_Press_-_Medium_Grip',
  'bench-press-dumbbell': 'Dumbbell_Bench_Press',
  'incline-bench-press-barbell': 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'incline-bench-press-dumbbell': 'Dumbbell_Incline_Bench_Press',
  'decline-bench-press-barbell': 'Barbell_Decline_Bench_Press',
  'chest-fly-dumbbell': 'Dumbbell_Flyes',
  'cable-crossover': 'Cable_Cross-Over',
  'pec-deck-fly': 'Butterfly',
  'chest-dip': 'Chest_Dip',
  'pull-over-dumbbell': 'Dumbbell_Pullover',
  'cable-fly-high-to-low': 'Cable_High_Fly',
  'cable-fly-low-to-high': 'Cable_Low_Fly',
  'chest-press-machine': 'Machine_Chest_Press',
  'deadlift-barbell': 'Barbell_Deadlift',
  'romanian-deadlift-barbell': 'Romanian_Deadlift',
  'sumo-deadlift': 'Sumo_Deadlift',
  'pull-up-overhand': 'Pull-up',
  'pull-up-underhand': 'Chin-up',
  'pull-up-neutral-grip': 'Neutral_Grip_Pull-Up',
  'barbell-row-overhand': 'Bent_Over_Barbell_Row',
  'one-arm-dumbbell-row': 'One-Arm_Dumbbell_Row',
  'lat-pulldown-wide-grip': 'Wide-Grip_Lat_Pulldown',
  'lat-pulldown-narrow-grip': 'Close-Grip_Lat_Pulldown',
  'seated-row-cable': 'Seated_Cable_Rows',
  'back-extension': 'Hyperextensions_Back_Extensions',
  'face-pull': 'Face_Pull',
  'shrug-barbell': 'Barbell_Shrug',
  'good-morning-barbell': 'Good_Morning',
  't-bar-row': 'T-Bar_Row_with_Handle',
  'rack-pull': 'Rack_Pull',
  'overhead-press-barbell': 'Barbell_Shoulder_Press',
  'seated-overhead-press-barbell': 'Seated_Barbell_Military_Press',
  'seated-dumbbell-press': 'Seated_Dumbbell_Press',
  'arnold-press': 'Arnold_Dumbbell_Press',
  'lateral-raise-dumbbell': 'Side_Lateral_Raise',
  'front-raise-dumbbell': 'Dumbbell_Front_Raise',
  'reverse-fly-dumbbell': 'Reverse_Flyes',
  'shoulder-press-machine': 'Machine_Shoulder_Press',
  'upright-row-barbell': 'Barbell_Upright_Row',
  'cable-lateral-raise': 'Cable_Lateral_Raise',
  'barbell-curl': 'Barbell_Curl',
  'ez-bar-curl': 'EZ-Bar_Curl',
  'alternating-dumbbell-curl': 'Dumbbell_Alternate_Bicep_Curl',
  'hammer-curl-dumbbell': 'Hammer_Curls',
  'concentration-curl': 'Concentration_Curls',
  'preacher-curl-barbell': 'Barbell_Preacher_Curl',
  'cable-curl': 'Cable_Hammer_Curl_-_Rope_Attachment',
  'incline-dumbbell-curl': 'Incline_Hammer_Curls',
  'spider-curl': 'Spider_Curl',
  'reverse-curl-barbell': 'Barbell_Reverse_Curl',
  'skull-crusher-barbell': 'Barbell_Lying_Triceps_Extension_Skull_Crushers',
  'skull-crusher-ez-bar': 'EZ-Bar_Lying_Triceps_Extension',
  'tricep-pushdown-rope': 'Triceps_Pushdown_-_Rope_Attachment',
  'tricep-pushdown-bar': 'Tricep_Pushdown',
  'bench-dip': 'Bench_Dips',
  'close-grip-bench-press': 'Close-Grip_Barbell_Bench_Press',
  'tricep-kickback-dumbbell': 'Dumbbell_Kickback',
  'overhead-extension-dumbbell': 'Dumbbell_One_Arm_Triceps_Extension',
  'diamond-push-up': 'Diamond_Push-up',
  'squat-barbell': 'Barbell_Full_Squat',
  'front-squat-barbell': 'Barbell_Front_Squat',
  'bulgarian-split-squat-dumbbell': 'Dumbbell_Bulgarian_Split_Squat',
  'leg-press': 'Leg_Press',
  'hack-squat-machine': 'Hack_Squat',
  'leg-extension-machine': 'Leg_Extensions',
  'lying-leg-curl-machine': 'Lying_Leg_Curls',
  'seated-leg-curl-machine': 'Seated_Leg_Curl',
  'hip-thrust-barbell': 'Barbell_Hip_Thrust',
  'walking-lunge-dumbbell': 'Dumbbell_Lunges',
  'standing-calf-raise-machine': 'Standing_Calf_Raises',
  'seated-calf-raise-plate-loaded': 'Seated_Calf_Raise',
  'hip-adductor-machine': 'Adductor',
  'hip-abductor-machine': 'Abductor',
  'romanian-deadlift-dumbbell': 'Dumbbell_Romanian_Deadlift',
  'glute-kickback-cable': 'Cable_Hip_Extension',
  'step-up-dumbbell': 'Dumbbell_Step_Ups',
  'goblet-squat': 'Dumbbell_Goblet_Squat',
  'crunch': 'Crunch',
  'cable-crunch': 'Cable_Crunch',
  'plank': 'Plank',
  'hanging-leg-raise': 'Hanging_Leg_Raise',
  'ab-rollout': 'Ab_Roller',
  'russian-twist-plate': 'Russian_Twist',
  'hanging-knee-raise': 'Hanging_Leg-Hip_Raise',
  'bicycle-crunch': 'Bicycle_Crunch',
  'leg-raise-flat-bench': 'Flat_Bench_Leg_Pull-In',
  'mountain-climber': 'Mountain_Climbers',
  'dragon-flag': 'Dragon_Flag',
  'decline-crunch': 'Decline_Crunch',
};

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) { resolve(true); return; }
    const file = fs.createWriteStream(dest);
    const req = https.get(url, { timeout: 10000 }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); fs.existsSync(dest) && fs.unlinkSync(dest);
        downloadFile(res.headers.location, dest).then(resolve);
        return;
      }
      if (res.statusCode !== 200) { file.close(); fs.existsSync(dest) && fs.unlinkSync(dest); resolve(false); return; }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    });
    req.on('error', () => { file.close(); fs.existsSync(dest) && fs.unlinkSync(dest); resolve(false); });
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

async function downloadAll() {
  let ok = 0, skip = 0, fail = 0;
  const entries = Object.entries(EXERCISE_MAP);
  
  for (const [filename, folder] of entries) {
    const dest = path.join(EX_DIR, filename + '.gif');
    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) { skip++; continue; }
    
    const url = BASE_URL + encodeURIComponent(folder) + '/0.gif';
    const success = await downloadFile(url, dest);
    
    if (success) { ok++; console.log('✓', filename); }
    else { fail++; console.log('✗', filename); }
    
    await new Promise(r => setTimeout(r, 80));
  }
  
  console.log(`\nDone: ${ok} downloaded, ${skip} cached, ${fail} failed`);
  return { ok, skip, fail };
}

module.exports = { downloadAll, EX_DIR };
if (require.main === module) downloadAll();

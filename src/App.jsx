import { useState, useMemo } from "react";

const themes = {
  light: {
    bg:"#f5f0e8", bgCard:"#ffffff", bgSecondary:"#f0ebe0", bgInput:"#ffffff",
    border:"#e0d8cc", text:"#2a1f0e", textSub:"#6b5c45", textMuted:"#9c8b78",
    headerBg:"linear-gradient(135deg, #1a3a6b 0%, #2d6a4f 100%)",
    shadow:"0 2px 12px rgba(0,0,0,0.08)", toggleBg:"#e0d8cc",
  },
  dark: {
    bg:"#0f0f1a", bgCard:"#1a1a2e", bgSecondary:"#13131f", bgInput:"#1e1e30",
    border:"rgba(255,255,255,0.1)", text:"#f0e6d3", textSub:"#a0b4c8", textMuted:"#6a7a8a",
    headerBg:"linear-gradient(135deg, #1a0533 0%, #0d1b4a 50%, #0a2a1a 100%)",
    shadow:"0 2px 12px rgba(0,0,0,0.4)", toggleBg:"#2a2a3e",
  }
};

const kidColors = ["#2196F3","#FF9800","#9C27B0","#00BCD4","#4CAF50","#FF5722","#3F51B5","#E91E63"];

function ftInToCm(ft,inches){return Math.round((parseInt(ft||0)*30.48)+(parseInt(inches||0)*2.54));}
function cmToFtIn(cm){const i=cm/2.54;return{ft:Math.floor(i/12),inches:Math.round(i%12)};}
function estimateHeightFromAge(years,months){
  const total=(parseInt(years)||0)*12+(parseInt(months)||0);
  const map={0:50,1:54,2:57,3:60,4:63,5:65,6:67,7:69,8:71,9:72,10:73,11:75,12:76,13:77,14:78,15:79,16:80,17:81,18:82,19:83,20:84,21:85,22:86,23:87,24:87,30:92,36:94,42:99,48:102,54:106,60:109,66:112,72:115,84:121,96:127,108:132,120:137,132:143,144:149,156:155};
  const keys=Object.keys(map).map(Number).sort((a,b)=>a-b);
  if(total<=0)return 50;if(total>=156)return 155;
  let lo=keys[0],hi=keys[keys.length-1];
  for(let k of keys){if(k<=total)lo=k;}
  for(let k of keys){if(k>=total){hi=k;break;}}
  if(lo===hi)return map[lo];
  return Math.round(map[lo]+((total-lo)/(hi-lo))*(map[hi]-map[lo]));
}
function isInfantAge(y,m){return((parseInt(y)||0)*12+(parseInt(m)||0))<24;}
function formatAge(y,m){const yr=parseInt(y)||0,mo=parseInt(m)||0;if(!yr&&!mo)return"";if(!yr)return`${mo}mo`;if(!mo)return`${yr}yr`;return`${yr}yr ${mo}mo`;}

// ─── Best time options (clean, consistent) ────────────────────────────────────
// bestTime: one of these clean labels
// tip: plain English extra context — warnings, paid pass advice, special notes

const infantPolicyConfig={
  welcome:{label:"✅ Infants welcome",    light:{bg:"#e8f5e9",text:"#2e7d32"},dark:{bg:"#1b3a1e",text:"#81c784"}},
  lap:    {label:"👶 Lap only",           light:{bg:"#e3f2fd",text:"#1565c0"},dark:{bg:"#0d2137",text:"#64b5f6"}},
  carrier:{label:"🎒 Carrier only",       light:{bg:"#fff8e1",text:"#f57f17"},dark:{bg:"#3a2e00",text:"#ffca28"}},
  none:   {label:"❌ No infants",         light:{bg:"#ffebee",text:"#c62828"},dark:{bg:"#2a0000",text:"#ef9a9a"}},
  check:  {label:"🎟️ Check at gate",      light:{bg:"#f3e5f5",text:"#6a1b9a"},dark:{bg:"#1e0a2e",text:"#ce93d8"}},
};
const thrillConfig={
  gentle:  {label:"😊 Gentle",  light:{bg:"#e8f5e9",text:"#2e7d32"},dark:{bg:"#1b3a1e",text:"#81c784"}},
  moderate:{label:"⚡ Moderate",light:{bg:"#fff8e1",text:"#f57f17"},dark:{bg:"#3a2e00",text:"#ffca28"}},
  thrill:  {label:"🔥 Thrill",  light:{bg:"#e3f2fd",text:"#1565c0"},dark:{bg:"#0d2137",text:"#64b5f6"}},
};
const bestTimeConfig={
  "Rope Drop":     {label:"🌅 Rope Drop",    desc:"Go right when the park opens — shortest waits of the day"},
  "Morning":       {label:"🌤️ Morning",      desc:"9am–12pm — crowds still manageable"},
  "Afternoon":     {label:"☀️ Afternoon",    desc:"12pm–4pm — works well as crowds shift to other areas"},
  "Midday":        {label:"🕛 Midday",       desc:"Around 12pm — often a quieter window"},
  "Evening":       {label:"🌆 Evening",      desc:"After 5pm — crowds thin out as families leave"},
  "Anytime":       {label:"🕐 Anytime",      desc:"Consistently short waits — go whenever suits you"},
  "Check Schedule":{label:"📅 Check Schedule",desc:"Show times vary — check the park app on the day"},
};

const parks=[
  // ═══════════════ MAGIC KINGDOM ═══════════════
  {id:"mk",name:"Magic Kingdom",operator:"Disney",emoji:"🏰",color:"#1a6fc4",accent:"#1a6fc4",bestAge:"2–8 yrs",
   tip:"Best park for toddlers. Arrive right at opening to beat heat and crowds. 34 attractions across 6 lands.",
   rides:[
    {name:"Walt Disney World Railroad",land:"Main Street, U.S.A.",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Steam train circles the whole park with stops at Frontierland and Fantasyland. Perfect rest for tired legs. Almost no wait ever."},
    {name:"Main Street Vehicles",land:"Main Street, U.S.A.",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Morning",tip:"Vintage horse-drawn streetcars and antique automobiles travel down Main Street. Operates mornings only. Almost no wait — charming photo opportunity."},
    {name:"Happily Ever After (Fireworks Show)",land:"Main Street, U.S.A.",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Evening",tip:"Spectacular nighttime fireworks and castle projections show — the best free thing in the park. Starts around 9–10pm. Grab a spot on Main Street 30 mins early."},
    {name:"Move It! Shake It! Dance & Play It!",land:"Main Street, U.S.A.",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Check Schedule",tip:"Daytime street party parade with Disney characters. Check the park app for daily showtimes. Kids love dancing along."},
    {name:"Pirates of the Caribbean",land:"Adventureland",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Afternoon",tip:"Classic boat ride through Caribbean pirate scenes. Infants must sit on lap. Dark and slightly loud but most toddlers enjoy it. Shorter waits in the afternoon."},
    {name:"Jungle Cruise",land:"Adventureland",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Morning",tip:"Comedic guided boat tour past animatronic animals. Infants on lap. Famous for the skipper's terrible puns. Go in the first hour — waits build fast."},
    {name:"The Magic Carpets of Aladdin",land:"Adventureland",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Spinning ride you control — similar to Dumbo but less popular so shorter waits. Infants welcome. Watch out for the spitting camel!"},
    {name:"Walt Disney's Enchanted Tiki Room",land:"Adventureland",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Afternoon",tip:"Classic 10-minute air-conditioned show with singing animatronic birds. Great for toddlers. Almost no wait. Perfect midday heat escape."},
    {name:"A Pirate's Adventure",land:"Adventureland",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Interactive map-based scavenger hunt throughout Adventureland. Free to do anytime. Kids love collecting stamps at each of the five stations."},
    {name:"Big Thunder Mountain Railroad",land:"Frontierland",thrill:"moderate",height:112,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 112cm+. Runaway mine train coaster — fun but not too intense. The 'wildest ride in the wilderness.' Go at opening before waits climb."},
    {name:"Tiana's Bayou Adventure",land:"Frontierland",thrill:"moderate",height:97,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 97cm+. Log flume ride through Princess Tiana's bayou — you WILL get wet! Waits build fast in summer. Go in the morning."},
    {name:"Country Bear Musical Jamboree",land:"Frontierland",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Afternoon",tip:"Funny air-conditioned animatronic country music show. Toddlers love the silly bears. Great afternoon heat escape. Almost no wait."},
    {name:"Tom Sawyer Island",land:"Frontierland",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Morning",tip:"Outdoor playground island accessed by raft — caves, bridges, forts to explore. Infants welcome. More for kids 5+ who like physical exploration. Opens at 9am, closes at dusk."},
    {name:"Haunted Mansion",land:"Liberty Square",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Afternoon",tip:"Iconic dark ride with 999 happy haunts. Infants on lap. Spooky but most toddlers are fine. Very sensitive kids may be nervous. Shorter waits in the afternoon."},
    {name:"Liberty Square Riverboat",land:"Liberty Square",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Afternoon",tip:"Peaceful 20-minute riverboat cruise. Infants welcome. Great way to rest tired feet. Almost no wait — just walk on when ready."},
    {name:"Hall of Presidents",land:"Liberty Square",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Afternoon",tip:"Air-conditioned theater show with animatronic US presidents. 25 minutes. More interesting for adults than toddlers. Great afternoon heat escape."},
    {name:"Seven Dwarfs Mine Train",land:"Fantasyland",thrill:"moderate",height:97,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 97cm+. Swinging mine train coaster — the most popular family coaster at Disney. Waits hit 60–90 mins fast. Lightning Lane (paid skip-the-line) is strongly recommended."},
    {name:"Peter Pan's Flight",land:"Fantasyland",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Rope Drop",tip:"Classic flying pirate ship ride over London and Never Land. Infants on lap. One of the slowest-loading rides in the park — waits hit 60–90 mins. Go at opening or use Lightning Lane."},
    {name:"it's a small world",land:"Fantasyland",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Anytime",tip:"Gentle boat ride through colourful international scenes. Infants on lap — no carriers in boats. Consistently short waits all day. The song will stick in your head for days!"},
    {name:"The Many Adventures of Winnie the Pooh",land:"Fantasyland",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Morning",tip:"Gentle dark ride through the Hundred Acre Wood. Infants on lap. Perfect first ride for toddlers. Go in the morning before waits build past 30 mins."},
    {name:"Under the Sea — Journey of the Little Mermaid",land:"Fantasyland",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Morning",tip:"Clamshell ride through Ariel's underwater world. Infants on lap. Beautiful animatronics and music. Shorter waits than Peter Pan and Mine Train — underrated."},
    {name:"Prince Charming Regal Carrousel",land:"Fantasyland",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Classic Cinderella-themed carousel. Infants welcome. Almost no wait ever. Lovely photo spot with the castle in the background."},
    {name:"Mad Tea Party (Teacups)",land:"Fantasyland",thrill:"gentle",height:null,infantPolicy:"none",bestTime:"Anytime",tip:"Spinning Alice in Wonderland teacup ride. No infants. Control spinning speed with the centre wheel — take it easy with toddlers. Fun but can get dizzy."},
    {name:"Dumbo the Flying Elephant",land:"Fantasyland",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Rope Drop",tip:"Iconic spinning elephant ride — control how high you fly. Infants welcome. Very popular with little ones — go at opening or during the afternoon parade when crowds thin."},
    {name:"The Barnstormer",land:"Fantasyland",thrill:"moderate",height:89,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 89cm+. Junior roller coaster starring Goofy — the perfect first coaster for young kids. Short, fun, not scary. No infants. Great morning starter before crowds build."},
    {name:"Enchanted Tales with Belle",land:"Fantasyland",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Morning",tip:"Interactive storytelling experience — kids volunteer to act in Beauty and the Beast. Infants welcome. Very popular with little ones. Join the queue in the morning."},
    {name:"Mickey's PhilharMagic",land:"Fantasyland",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Afternoon",tip:"Brilliant air-conditioned 3D musical show with Donald Duck through Disney classics. Infants welcome. 12 minutes, almost no wait. Great afternoon break."},
    {name:"TRON Lightcycle / Run",land:"Tomorrowland",thrill:"thrill",height:112,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 112cm+. Newest and fastest ride in Magic Kingdom — motorcycle coaster. Lightning Lane (paid skip-the-line) is essential. Waits exceed 90 mins daily."},
    {name:"Space Mountain",land:"Tomorrowland",thrill:"thrill",height:112,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 112cm+. Classic indoor roller coaster in the dark. Rougher than it looks. Not for kids who scare easily. Go at opening before waits hit 60+ mins."},
    {name:"Buzz Lightyear's Space Ranger Spin",land:"Tomorrowland",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Morning",tip:"Interactive shooting ride — blast targets with your laser to defeat Zurg. Infants on lap. Great for all ages 3+. Moderate waits in the morning."},
    {name:"Tomorrowland Speedway",land:"Tomorrowland",thrill:"gentle",height:54,infantPolicy:"none",bestTime:"Midday",tip:"Gas-powered cars on a track. Child must be 54cm+ to ride (most toddlers qualify). Adults help steer. No infants. Lines can be surprisingly long — go at midday."},
    {name:"Tomorrowland Transit Authority PeopleMover",land:"Tomorrowland",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Elevated gentle tour of Tomorrowland — you even see inside Space Mountain! Infants welcome. Almost always no wait. Perfect for resting or napping toddlers."},
    {name:"Astro Orbiter",land:"Tomorrowland",thrill:"gentle",height:null,infantPolicy:"none",bestTime:"Anytime",tip:"Spinning rocket ride high above Tomorrowland. No infants (safety policy despite no height requirement). Great views of the park. Short waits."},
    {name:"Monsters, Inc. Laugh Floor",land:"Tomorrowland",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Afternoon",tip:"Interactive comedy show where Monsters Inc. characters interact with the audience live via screens — they may pick your child! Infants welcome. Air-conditioned. Great afternoon break."},
  ]},

  // ═══════════════ EPCOT ═══════════════
  {id:"epcot",name:"EPCOT",operator:"Disney",emoji:"🌍",color:"#0a7c59",accent:"#0a7c59",bestAge:"5+ yrs",
   tip:"Four areas: World Celebration, World Discovery, World Nature, and 11-country World Showcase. Best for food, culture, and older kids. 15 attractions.",
   rides:[
    {name:"Spaceship Earth",land:"World Celebration",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Afternoon",tip:"Iconic slow journey through human history inside the giant golf ball. Infants on lap. Fascinating and relaxing. Waits rarely exceed 20–30 mins — great afternoon choice."},
    {name:"Disney & Pixar Short Film Festival",land:"World Celebration",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Afternoon",tip:"Air-conditioned 4D film shorts from beloved Pixar films. Infants welcome. Great midday heat escape. About 20 minutes. Almost no wait."},
    {name:"Guardians of the Galaxy: Cosmic Rewind",land:"World Discovery",thrill:"thrill",height:122,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 122cm+. Reverse-launch indoor coaster with music — Disney's most innovative new ride. Requires paid Lightning Lane purchase. Book as soon as you enter the park."},
    {name:"Test Track",land:"World Discovery",thrill:"moderate",height:102,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 102cm+. Design a car then test it at high speed on a track. Interactive queue. No infants. Moderate waits in the morning."},
    {name:"Mission: SPACE",land:"World Discovery",thrill:"thrill",height:112,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 112cm+. Two versions: intense Orange Mission (full simulated space launch — can cause motion sickness) or gentler Green Mission. No infants on either."},
    {name:"Soarin' Across America",land:"World Nature",thrill:"gentle",height:97,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 97cm+. Reimagined in 2026 for America's 250th anniversary — giant hang-gliding film over US landmarks. No infants. Waits build very fast — go at opening or Lightning Lane."},
    {name:"Living with the Land",land:"World Nature",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Anytime",tip:"Peaceful boat tour through real working greenhouses that grow food for Disney restaurants. Infants on lap. Educational and relaxing. Underrated — short waits all day."},
    {name:"The Seas with Nemo & Friends",land:"World Nature",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Anytime",tip:"Clamshell ride through Finding Nemo scenes into a real aquarium. Infants on lap. Great for toddlers. Turtle Talk with Crush (free interactive show) is inside too."},
    {name:"Journey of Water, Inspired by Moana",land:"World Nature",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Outdoor walk-through water play experience. Infants welcome. Interactive water features kids love. No wait — walk at your own pace. Great for toddlers on a hot day."},
    {name:"Frozen Ever After",land:"Norway Pavilion",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Rope Drop",tip:"Infants on lap. Hugely popular boat ride through Frozen scenes. Waits hit 60–90 mins by mid-morning. Go right at opening or use paid Lightning Lane."},
    {name:"Remy's Ratatouille Adventure",land:"France Pavilion",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Rope Drop",tip:"Infants on lap. Shrunk-down trackless ride through a giant kitchen with Remy the rat. Very popular — go right at opening or use paid Lightning Lane."},
    {name:"Gran Fiesta Tour Starring the Three Caballeros",land:"Mexico Pavilion",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Anytime",tip:"Gentle boat ride through colourful Mexican scenes. Infants on lap. Short waits all day. Relaxing and underrated — a hidden gem in World Showcase."},
    {name:"Reflections of China (Film)",land:"China Pavilion",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Standing 360-degree film about China's landscapes. Infants welcome. Short waits. Educational and visually stunning. Good anytime filler in World Showcase."},
    {name:"The American Adventure",land:"American Pavilion",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Afternoon",tip:"Air-conditioned animatronic theatre show about American history. Infants welcome. 30 minutes. Technically impressive. Great afternoon heat escape."},
    {name:"Impressions de France (Film)",land:"France Pavilion",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Afternoon",tip:"Relaxing sit-down cinema film about France. Infants welcome. Air-conditioned. About 20 minutes. Very short waits. Lovely for a midday rest."},
  ]},

  // ═══════════════ HOLLYWOOD STUDIOS ═══════════════
  {id:"hs",name:"Hollywood Studios",operator:"Disney",emoji:"🎬",color:"#8b1a1a",accent:"#c0392b",bestAge:"6+ yrs",
   tip:"Mostly thrill and moderate rides. Toy Story Land is the toddler zone. New Walt Disney Studios Courtyard opens May 2026. 11 attractions.",
   rides:[
    {name:"Slinky Dog Dash",land:"Toy Story Land",thrill:"moderate",height:97,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 97cm+. Fun family coaster shaped like a stretched Slinky Dog. Very popular. Go right at opening as waits exceed 60 mins fast."},
    {name:"Toy Story Mania!",land:"Toy Story Land",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Morning",tip:"Infants on lap. Interactive 4D shooting carnival game — great fun for all ages. Huge for kids who are too small for other rides. Shorter waits in the morning."},
    {name:"Alien Swirling Saucers",land:"Toy Story Land",thrill:"gentle",height:97,infantPolicy:"none",bestTime:"Anytime",tip:"Child must be 97cm+. Spinning saucer ride. No infants. Consistently shorter waits than Slinky Dog — good anytime filler in Toy Story Land."},
    {name:"Star Wars: Rise of the Resistance",land:"Galaxy's Edge",thrill:"moderate",height:102,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 102cm+. Extraordinary 20-minute immersive experience — one of the best rides Disney has ever built. Paid Lightning Lane essential. Waits hit 90–120 mins."},
    {name:"Millennium Falcon: Smugglers Run",land:"Galaxy's Edge",thrill:"moderate",height:97,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 97cm+. You pilot the Millennium Falcon — each person has a role (pilot, gunner, engineer). Go in the morning before Rise of the Resistance crowds build."},
    {name:"Tower of Terror",land:"Hollywood Blvd",thrill:"thrill",height:102,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 102cm+. Haunted hotel elevator drop ride — very intense. Not for kids nervous of heights or sudden drops. Go early before waits build past 60 mins."},
    {name:"Rock 'n' Roller Coaster",land:"Hollywood Blvd",thrill:"thrill",height:122,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 122cm+. Indoor high-speed coaster with loops — goes from 0 to 60 in 2.8 seconds. Very intense. Go right at opening."},
    {name:"Mickey & Minnie's Runaway Railway",land:"Hollywood Blvd",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Morning",tip:"Infants on lap. Brilliant trackless ride through a Mickey cartoon world. One of Disney's best newer rides. Paid Lightning Lane recommended as waits build quickly."},
    {name:"Indiana Jones Epic Stunt Spectacular",land:"Echo Lake",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Check Schedule",tip:"Infants welcome. Live 30-minute stunt show recreating Indiana Jones movie scenes. Air-conditioned. Spectacular for all ages — check app for showtimes."},
    {name:"Star Tours — The Adventures Continue",land:"Echo Lake",thrill:"moderate",height:102,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 102cm+. Star Wars motion-simulator flight — dozens of different story combinations. Can cause motion sickness. Go in the morning."},
    {name:"Disney Jr. Mickey Mouse Clubhouse Live!",land:"Walt Disney Studios Courtyard",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Check Schedule",tip:"NEW May 2026! Interactive live show with Mickey and friends. Perfect for toddlers and young children. Check the app for showtimes. No wait for the show itself."},
  ]},

  // ═══════════════ ANIMAL KINGDOM ═══════════════
  {id:"ak",name:"Animal Kingdom",operator:"Disney",emoji:"🦁",color:"#5a7a2e",accent:"#5a7a2e",bestAge:"3+ yrs",
   tip:"⚠️ DinoLand U.S.A. closed permanently Feb 2026 (new Tropical Americas land coming 2027). Current operating rides: 7 rides + shows + walking trails.",
   rides:[
    {name:"Avatar Flight of Passage",land:"Pandora",thrill:"thrill",height:112,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 112cm+. Breathtaking motorbike simulator flying over Pandora — widely considered one of Disney's best rides ever. Waits hit 90–150 mins. Paid Lightning Lane is essential."},
    {name:"Na'vi River Journey",land:"Pandora",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Morning",tip:"Infants on lap. Beautiful gentle boat through a glowing bioluminescent forest. Stunning Shaman of Songs animatronic at the end. Waits build fast — go early or use Lightning Lane."},
    {name:"Kilimanjaro Safaris",land:"Africa",thrill:"gentle",height:null,infantPolicy:"carrier",bestTime:"Rope Drop",tip:"Infants in carriers allowed. 18-minute real animal safari — lions, elephants, giraffes, rhinos, hippos. Animals most active at opening. Always go first thing in the morning."},
    {name:"Wildlife Express Train to Rafiki's Planet Watch",land:"Africa",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Morning",tip:"Infants welcome. Short train ride to Rafiki's Planet Watch — conservation centre with behind-the-scenes animal care and activities. Relaxing with short waits."},
    {name:"Gorilla Falls Exploration Trail",land:"Africa",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Morning",tip:"Infants welcome. Walk-through trail with gorillas, hippos, exotic birds, and naked mole rats. Self-paced, no wait. Animals most active in the morning."},
    {name:"Festival of the Lion King (Show)",land:"Africa",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Check Schedule",tip:"Infants welcome. Incredible 30-minute live show with acrobatics, fire dancing, and beloved Lion King songs. Widely considered the best live show at Disney World. Check app for times."},
    {name:"Expedition Everest",land:"Asia",thrill:"thrill",height:112,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 112cm+. High-speed coaster through the Himalayas with a backwards section and the Yeti. One of Disney's best coasters. Go at opening before waits climb past 60 mins."},
    {name:"Kali River Rapids",land:"Asia",thrill:"moderate",height:97,infantPolicy:"none",bestTime:"Afternoon",tip:"Child must be 97cm+. River rapids — you WILL get wet. Best in the hottest part of the afternoon. Poncho recommended. No infants."},
    {name:"Maharajah Jungle Trek",land:"Asia",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Morning",tip:"Infants welcome. Walk-through trail with tigers, giant fruit bats, and Komodo dragons. Self-paced, no wait. Animals most active in the morning."},
    {name:"Finding Nemo: The Big Blue & Beyond (Show)",land:"Discovery Island",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Check Schedule",tip:"Infants welcome. Updated Finding Nemo live musical show. Great for toddlers who love Nemo. Air-conditioned theatre. Check app for showtimes."},
    {name:"Zootopia: Better Zoogether!",land:"Discovery Island",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Morning",tip:"Infants on lap. Brand new 2025 trackless adventure ride with Judy Hopps and Nick Wilde through Zootopia. Becoming very popular — go in the morning."},
    {name:"Discovery River Boats",land:"Discovery Island",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Afternoon",tip:"Infants welcome. Relaxing boat cruise around the Discovery River. Easy, short waits. Good late afternoon activity for tired feet."},
  ]},

  // ═══════════════ UNIVERSAL STUDIOS FLORIDA ═══════════════
  {id:"usf",name:"Universal Studios Florida",operator:"Universal",emoji:"🎥",color:"#1a1a6e",accent:"#1565C0",bestAge:"6+ yrs",
   tip:"Minion Blast, E.T., Fievel's Playland and KidZone are great for younger kids. Diagon Alley is a must for Harry Potter fans. 11 attractions.",
   rides:[
    {name:"Hollywood Rip Ride Rockit",land:"Production Central",thrill:"thrill",height:122,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 122cm+. Very tall loop coaster with personal music selection. Very intense. Not for those nervous of heights. Go at opening."},
    {name:"Illumination's Villain-Con Minion Blast",land:"Production Central",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Morning",tip:"Infants on lap. New interactive shooter ride — blast targets as a villain-in-training. Replaced Despicable Me Minion Mayhem. Fun for all ages. Shorter waits in the morning."},
    {name:"Revenge of the Mummy",land:"New York",thrill:"thrill",height:122,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 122cm+. Intense indoor coaster with darkness, fire effects, and psychological scare tactics. One of Universal's best classic rides. Express Pass (paid skip-the-line) recommended."},
    {name:"Race Through New York with Jimmy Fallon",land:"New York",thrill:"gentle",height:97,infantPolicy:"none",bestTime:"Anytime",tip:"Child must be 97cm+. Motion simulator race through NYC. Indoor air-conditioned. Usually shorter waits — great choice on a hot afternoon."},
    {name:"Kang & Kodos' Twirl 'n' Hurl",land:"Springfield",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Anytime",tip:"Infants on lap. Spinning Simpsons-themed ride — control how high you fly while aliens hurl you. Short waits all day. Good for toddlers."},
    {name:"Fast & Furious: Supercharged",land:"San Francisco",thrill:"moderate",height:97,infantPolicy:"none",bestTime:"Afternoon",tip:"Child must be 97cm+. Note: closing permanently 2027. High-speed motion simulator. Shorter waits than other big rides — go in the afternoon."},
    {name:"Men in Black Alien Attack",land:"World Expo",thrill:"moderate",height:102,infantPolicy:"none",bestTime:"Afternoon",tip:"Child must be 102cm+. Interactive shooting ride — compete against other cars for the highest score. Shorter waits in the afternoon."},
    {name:"Harry Potter and the Escape from Gringotts",land:"Diagon Alley",thrill:"moderate",height:102,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 102cm+. Multi-sensory dragon coaster through Gringotts bank — one of the park's best rides. Go right at opening or use Express Pass (paid skip-the-line)."},
    {name:"Hogwarts Express — King's Cross Station",land:"Diagon Alley",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Morning",tip:"Infants on lap. Magical train ride to Hogsmeade (Islands of Adventure) — each direction is a different experience. Requires park-to-park ticket. Incredibly immersive."},
    {name:"E.T. Adventure",land:"KidZone",thrill:"gentle",height:86,infantPolicy:"lap",bestTime:"Anytime",tip:"Child must be 86cm+ (most toddlers qualify). Infants on lap. Classic gentle bike-ride to E.T.'s home planet. One of the few rides great for very young toddlers. Short waits all day."},
    {name:"Fievel's Playland",land:"KidZone",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Infants welcome. Giant outdoor water playground. No queue — just a play area. Great for toddlers to run around. Warning: kids WILL get wet."},
  ]},

  // ═══════════════ ISLANDS OF ADVENTURE ═══════════════
  {id:"ioa",name:"Islands of Adventure",operator:"Universal",emoji:"⚓",color:"#2c4a7c",accent:"#1976D2",bestAge:"7+ yrs",
   tip:"Seuss Landing is the toddler zone. Hagrid's and VelociCoaster are must-dos. NOTE: Jurassic Park River Adventure closed Jan–Nov 2026 for refurbishment. 20 attractions.",
   rides:[
    {name:"Hogwarts Express — Hogsmeade Station",land:"Port of Entry",thrill:"gentle",height:null,infantPolicy:"lap",bestTime:"Morning",tip:"Infants on lap. Train to Diagon Alley (Universal Studios Florida) — completely different experience each direction. Requires park-to-park ticket. Magically immersive."},
    {name:"The Cat in the Hat",land:"Seuss Landing",thrill:"gentle",height:91,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 91cm+. Fun spinning storybook ride through Dr. Seuss scenes. No infants. Most toddlers over 2 years old will qualify. Go in the morning for shorter waits."},
    {name:"One Fish Two Fish Red Fish Blue Fish",land:"Seuss Landing",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Infants welcome. Spinning water sprayer — you control if you get wet by following the rhymes. Short waits all day. Great for toddlers."},
    {name:"Caro-Seuss-el",land:"Seuss Landing",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Infants welcome. Seuss character carousel. Almost no wait ever. Lovely for very little ones."},
    {name:"The High in the Sky Seuss Trolley Train Ride",land:"Seuss Landing",thrill:"gentle",height:91,infantPolicy:"none",bestTime:"Anytime",tip:"Child must be 91cm+. Elevated train through Seuss Landing with story narration and great views. Short waits. Fun for toddlers who meet the height requirement."},
    {name:"If I Ran the Zoo (Playground)",land:"Seuss Landing",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Infants welcome. Interactive water play area and climbing structures. No queue. Warning: kids WILL get wet. Great energy burner for toddlers."},
    {name:"The Incredible Hulk Coaster",land:"Marvel Super Hero Island",thrill:"thrill",height:137,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 137cm+ (54 inches). Very intense launch coaster with loops and roaring sound. Adults and very tall older kids only. Go at opening."},
    {name:"The Amazing Adventures of Spider-Man",land:"Marvel Super Hero Island",thrill:"moderate",height:102,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 102cm+. Classic 3D motion simulator with Spider-Man — one of Universal's best rides. Exciting but not too intense. Go in the morning."},
    {name:"Doctor Doom's Fearfall",land:"Marvel Super Hero Island",thrill:"thrill",height:130,infantPolicy:"none",bestTime:"Anytime",tip:"Child must be 130cm+ (52 inches). Drop tower — shot up and dropped repeatedly. Intense. Adults and very tall kids only. Shorter waits than the coasters."},
    {name:"Storm Force Accelatron",land:"Marvel Super Hero Island",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Infants welcome. X-Men Storm themed spinning teacup-style ride. No height requirement. Short waits all day. Good for toddlers wanting a spin."},
    {name:"Skull Island: Reign of Kong",land:"Skull Island",thrill:"moderate",height:91,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 91cm+. 3D jeep ride with King Kong — dark, loud, and intense. May frighten younger kids. No infants. Go in the morning for shorter waits."},
    {name:"Jurassic World VelociCoaster",land:"Jurassic World",thrill:"thrill",height:122,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 122cm+. High-speed launch coaster — widely considered one of the best coasters in the world. Multiple inversions. Very intense. Go right at opening."},
    {name:"Jurassic Park River Adventure",land:"Jurassic World",thrill:"moderate",height:107,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 107cm+. ⚠️ CLOSED Jan–Nov 2026 for refurbishment. Returns late 2026 — boat ride past dinosaurs with an 85-foot water drop. You will get soaked."},
    {name:"Pteranodon Flyers",land:"Jurassic World",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Morning",tip:"Infants welcome. Aerial glider over Camp Jurassic. ⚠️ Closed Feb–May 2026, reopens before July visit. Short but scenic. Often limited to children with adult accompanying."},
    {name:"Camp Jurassic (Playground)",land:"Jurassic World",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Infants welcome. Huge multi-level outdoor playground with water guns, dinosaur fossils, caves, and climbing structures. No wait. Great for kids to burn energy."},
    {name:"Hagrid's Magical Creatures Motorbike Adventure",land:"Hogsmeade",thrill:"moderate",height:122,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 122cm+. Widely considered one of the best theme park rides in the world. Multiple launches, backwards section, live creatures. Waits hit 2–3 hours. Arrive 30 mins before the park opens and go straight here."},
    {name:"Harry Potter and the Forbidden Journey",land:"Hogsmeade",thrill:"thrill",height:122,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 122cm+. Immersive flying simulator through Hogwarts — one of the most impressive rides ever built. Waits hit 60–90 mins. Express Pass or go at opening."},
    {name:"Flight of the Hippogriff",land:"Hogsmeade",thrill:"moderate",height:99,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 99cm+. Short outdoor coaster — great starter coaster for kids. No infants. Go in the morning before the queue builds."},
    {name:"Popeye & Bluto's Bilge-Rat Barges",land:"Toon Lagoon",thrill:"moderate",height:107,infantPolicy:"none",bestTime:"Afternoon",tip:"Child must be 107cm+. River rapids — you WILL get drenched. Best in the afternoon heat. Poncho strongly recommended. No infants."},
    {name:"Dudley Do-Right's Ripsaw Falls",land:"Toon Lagoon",thrill:"moderate",height:107,infantPolicy:"none",bestTime:"Afternoon",tip:"Child must be 107cm+. Log flume with a dramatic underground drop — very wet. Best in the afternoon. No infants."},
  ]},

  // ═══════════════ EPIC UNIVERSE ═══════════════
  {id:"eu",name:"Epic Universe",operator:"Universal",emoji:"✨",color:"#4a0080",accent:"#7B1FA2",bestAge:"6+ yrs",
   tip:"Opened May 2025 — Universal's newest and most ambitious park! 5 worlds, 14 attractions. Expect high demand all summer 2026. Separate campus — 15 mins from the other parks.",
   rides:[
    {name:"Stardust Racers",land:"Celestial Park",thrill:"thrill",height:122,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 122cm+ (48in). Dual-track racing coaster — two trains launch simultaneously side-by-side. Fast, smooth and thrilling. Very popular. Go at opening."},
    {name:"Constellation Carousel",land:"Celestial Park",thrill:"gentle",height:null,infantPolicy:"none",bestTime:"Anytime",tip:"No height requirement but no infants — child must be able to sit independently. Beautiful celestial-themed carousel. Short waits. Good for toddlers who can sit unassisted."},
    {name:"Fyre Drill (Interactive Water Experience)",land:"Celestial Park",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Infants welcome. Interactive outdoor water play in Celestial Park. Kids control water cannons and effects. No wait — walk up and play. Great for cooling down in the heat."},
    {name:"Harry Potter & the Battle at the Ministry",land:"Ministry of Magic",thrill:"moderate",height:102,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 102cm+ (40in). Dark ride through the Ministry of Magic with incredible detail and storytelling. Expect very long waits all summer — go at opening."},
    {name:"The Dark Arts at Hogwarts Castle (Show)",land:"Ministry of Magic",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Check Schedule",tip:"Infants welcome. Stunning outdoor projection show on a replica Hogwarts Castle. Check the Universal app for daily showtimes. Just arrive a few minutes early for a good spot."},
    {name:"Mario Kart: Bowser's Challenge",land:"Super Nintendo World",thrill:"gentle",height:107,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 107cm+ (42in). Augmented reality kart race through Mario levels — one of the most innovative rides ever built. Expect very long waits — go at opening."},
    {name:"Yoshi's Adventure",land:"Super Nintendo World",thrill:"gentle",height:86,infantPolicy:"lap",bestTime:"Morning",tip:"Child must be 86cm+ (34in). Infants on lap with supervising companion. Gentle Yoshi ride — the most family-friendly attraction at Epic Universe. Good for toddlers who meet height."},
    {name:"Mine-Cart Madness",land:"Super Nintendo World",thrill:"moderate",height:107,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 107cm+. Exciting mine-cart coaster through DK Donkey Kong levels — a surprise hit. Smoother than you'd expect with fun interactive moments. Go in the morning."},
    {name:"Hiccup's Wing Gliders",land:"Isle of Berk",thrill:"moderate",height:102,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 102cm+ (40in). Suspended coaster gliding over Isle of Berk — graceful and thrilling. One of the park's must-dos. Go in the morning for shorter waits."},
    {name:"Dragon Racer's Rally",land:"Isle of Berk",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Anytime",tip:"Infants welcome. Family spinning dragon ride — similar to Dumbo. No height requirement. Great for little ones. Short waits. Scenic views of Isle of Berk."},
    {name:"The Untrainable Dragon (Live Show)",land:"Isle of Berk",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Check Schedule",tip:"Infants welcome. Live stunt and acrobatics show featuring dragon trainers. Spectacular outdoor theatre. Check the Universal app for showtimes."},
    {name:"Monsters Unchained: The Frankenstein Experiment",land:"Dark Universe",thrill:"thrill",height:122,infantPolicy:"none",bestTime:"Rope Drop",tip:"Child must be 122cm+ (48in). Immersive dark ride through a monster laboratory with intense scares — one of the most technically impressive rides at Epic Universe. Go at opening."},
    {name:"Curse of the Werewolf",land:"Dark Universe",thrill:"thrill",height:122,infantPolicy:"none",bestTime:"Morning",tip:"Child must be 122cm+ (48in). High-speed motorcycle coaster through a werewolf chase — fast and very intense. One of the best coasters at Epic Universe. Go in the morning."},
    {name:"Le Cirque Arcanus (Show)",land:"Dark Universe",thrill:"gentle",height:null,infantPolicy:"welcome",bestTime:"Check Schedule",tip:"Infants welcome. Dark and mysterious live circus show in the Dark Universe area. Atmospheric and entertaining for all ages. Check Universal app for showtimes."},
  ]},
];;

// ─── Zone Accordion ───────────────────────────────────────────────────────────
function ZoneAccordion({park,filteredRides,validMembers,openZone,setOpenZone,darkMode,t,canRide}){
  const zones=[...new Set(park.rides.map(r=>r.land))];
  return(
    <div>
      {/* Zone chips */}
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:16}}>
        {zones.map(zone=>{
          const filtered=filteredRides.filter(r=>r.land===zone);
          const count=filtered.length;
          const isEmpty=count===0;
          const isOpen=openZone===zone;
          let dotColor=t.textMuted;
          if(validMembers.length>0&&count>0){
            const allGood=filtered.every(r=>validMembers.every(m=>canRide(r,m)));
            const noneGood=filtered.every(r=>validMembers.every(m=>!canRide(r,m)));
            dotColor=allGood?"#4CAF50":noneGood?"#ef5350":"#FFA726";
          }
          return(
            <button key={zone} disabled={isEmpty} onClick={()=>setOpenZone(isOpen?null:zone)} style={{
              padding:"7px 14px",borderRadius:20,fontFamily:"Georgia,serif",
              border:isOpen?`2px solid ${park.accent}`:`1.5px solid ${isEmpty?t.border:t.border}`,
              background:isOpen?park.accent:isEmpty?t.bgSecondary:t.bgCard,
              color:isOpen?"#fff":isEmpty?t.textMuted:t.text,
              fontSize:12,fontWeight:isOpen?700:500,cursor:isEmpty?"not-allowed":"pointer",
              opacity:isEmpty?0.4:1,display:"flex",alignItems:"center",gap:6,
              transition:"all 0.18s",boxShadow:isOpen?`0 2px 8px ${park.accent}40`:"none",
            }}>
              {!isEmpty&&<span style={{width:8,height:8,borderRadius:"50%",background:isOpen?"rgba(255,255,255,0.7)":dotColor,display:"inline-block",flexShrink:0}}/>}
              {zone}
              <span style={{fontSize:10,background:isOpen?"rgba(255,255,255,0.2)":(darkMode?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.07)"),borderRadius:10,padding:"1px 6px",fontWeight:600}}>{count}</span>
              <span style={{fontSize:10}}>{isOpen?"▲":"▼"}</span>
            </button>
          );
        })}
      </div>

      {/* Ride list — filtered by zone if one is selected */}
      {(() => {
        const displayRides = openZone ? filteredRides.filter(r => r.land === openZone) : filteredRides;
        return (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {displayRides.length===0?(
              <div style={{textAlign:"center",padding:"32px",color:t.textMuted,fontSize:14}}>
                {openZone ? `No rides match your filters in ${openZone}.` : "No rides match your filters. Try adjusting!"}
              </div>
            ):displayRides.map((ride,ri)=>{
              const allGood=validMembers.length>0&&validMembers.every(m=>canRide(ride,m));
              const noneGood=validMembers.length>0&&validMembers.every(m=>!canRide(ride,m));
              const tc=thrillConfig[ride.thrill];
              const tC=darkMode?tc.dark:tc.light;
              const ipc=infantPolicyConfig[ride.infantPolicy];
              const iC=darkMode?ipc.dark:ipc.light;
              const btc=bestTimeConfig[ride.bestTime]||bestTimeConfig["Anytime"];
              const cardBorder=validMembers.length===0?t.border:allGood?"#a5d6a7":noneGood?"#ef9a9a":"#ffe082";

              return(
                <div key={ri} className="ride-card" style={{
                  background:t.bgCard,
                  border:`1.5px solid ${cardBorder}`,borderRadius:12,padding:"13px 14px",
                  boxShadow:t.shadow,
                }}>
                  {/* Zone label */}
                  <div style={{fontSize:10,color:t.textMuted,fontWeight:600,marginBottom:4}}>
                    📍 {ride.land}
                  </div>

              {/* Row: Ride name (full width) */}
              <div style={{fontSize:14,fontWeight:"bold",color:t.text,marginBottom:8,lineHeight:1.4}}>{ride.name}</div>

              {/* Row: Chips left | Height pill right — fixed, never wraps */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:0}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,flex:1}}>
                  <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:tC.bg,color:tC.text,fontWeight:600,whiteSpace:"nowrap"}}>{tc.label}</span>
                  <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:iC.bg,color:iC.text,fontWeight:600,whiteSpace:"nowrap"}}>{ipc.label}</span>
                  <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:darkMode?"#1e1e30":"#f0ebe0",color:t.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{btc.label}</span>
                </div>
                {/* Height pill — fixed width, always right */}
                <div style={{background:ride.height?(darkMode?"#2a1200":"#fff3e0"):(darkMode?"#0d2a0d":"#e8f5e9"),border:`1px solid ${ride.height?"#ffb74d":"#81c784"}`,borderRadius:8,padding:"5px 10px",textAlign:"center",minWidth:80,flexShrink:0}}>
                  <div style={{fontSize:10,color:t.textMuted,whiteSpace:"nowrap"}}>📏 Min height</div>
                  <div style={{fontSize:12,fontWeight:"bold",color:ride.height?"#e65100":"#2e7d32",whiteSpace:"nowrap"}}>{ride.height?`${ride.height}cm`:"No limit"}</div>
                  {ride.height&&<div style={{fontSize:10,color:t.textMuted,whiteSpace:"nowrap"}}>({cmToFtIn(ride.height).ft}ft {cmToFtIn(ride.height).inches}in)</div>}
                </div>
              </div>

              {/* Pro tip */}
              {ride.tip&&(
                <div style={{fontSize:12,color:t.textSub,background:t.bgSecondary,borderRadius:8,padding:"7px 10px",marginTop:8,lineHeight:1.6}}>
                  💡 {ride.tip}
                </div>
              )}

              {/* Best time description */}
              <div style={{fontSize:11,color:t.textMuted,marginTop:6,paddingLeft:2}}>
                ⏱️ <strong style={{color:t.textSub}}>{btc.label}:</strong> {btc.desc}
              </div>

              {/* Per-member badges */}
              {validMembers.length>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
                  {validMembers.map((m,mi)=>{
                    const can=canRide(ride,m);
                    const infantBlocked=m.isInfant&&ride.infantPolicy==="none";
                    const heightBlocked=ride.height&&m.heightCmResolved<ride.height;
                    const reason=infantBlocked?"infants not allowed":heightBlocked?`needs ${ride.height-m.heightCmResolved}cm more`:"";
                    return(
                      <span key={mi} style={{fontSize:11,padding:"3px 9px",borderRadius:20,fontWeight:600,background:can?(darkMode?`${m.color}20`:`${m.color}15`):(darkMode?"rgba(183,28,28,0.15)":"#ffebee"),border:`1px solid ${can?m.color+"55":"#ef9a9a"}`,color:can?m.color:"#c62828"}}>
                        {m.isInfant?"👶":"🧒"} {can?"✅":"❌"} {m.displayName}{!can&&reason?` — ${reason}`:""}
                      </span>
                    );
                  })}
                </div>
              )}
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({t}){
  return(
    <div style={{marginTop:40,borderTop:`1px solid ${t.border}`,padding:"20px 24px",textAlign:"center",background:t.bgSecondary}}>
      <p style={{fontSize:12,color:t.textMuted,margin:"0 0 10px",lineHeight:1.7}}>
        ⚠️ <strong style={{color:t.textSub}}>Disclaimer:</strong> Ride requirements, height restrictions, and infant policies listed here are approximate and may have changed. Always verify with the official park website before your visit. We are not affiliated with Disney or Universal.
      </p>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        {[
          {label:"🏰 Disney World",        url:"https://disneyworld.disney.go.com/attractions/"},
          {label:"🎥 Universal Studios",    url:"https://www.universalorlando.com/web/en/us/theme-parks/universal-studios-florida"},
          {label:"⚓ Islands of Adventure", url:"https://www.universalorlando.com/web/en/us/theme-parks/islands-of-adventure"},
          {label:"✨ Epic Universe",        url:"https://www.universalorlando.com/web/en/us/theme-parks/epic-universe"},
        ].map(({label,url})=>(
          <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#1a6fc4",textDecoration:"none",padding:"5px 12px",borderRadius:20,border:"1px solid #1a6fc444",background:"#1a6fc410"}}>{label} ↗</a>
        ))}
      </div>
      <p style={{fontSize:11,color:t.textMuted,margin:"12px 0 0"}}>Built with ❤️ to help families plan the perfect Orlando trip</p>
    </div>
  );
}

// ─── Person setup card ────────────────────────────────────────────────────────
function PersonCard({member:m,index:i,darkMode,t,onUpdate,onRemove,canRemove}){
  const col=kidColors[i%kidColors.length];
  const autoInfant=isInfantAge(m.ageYears,m.ageMonths);
  const isInfant=m.infantOverride!==null?m.infantOverride:autoInfant;
  const hasAnyAge=m.ageYears!==""||m.ageMonths!=="";
  const hasHeight=m.heightUnit==="cm"?m.heightCm!=="":m.heightFt!==""||m.heightIn!=="";
  const computedCm=useMemo(()=>{
    if(m.heightUnit==="cm"&&m.heightCm!=="")return parseInt(m.heightCm);
    if(m.heightUnit==="ftin"&&(m.heightFt!==""||m.heightIn!==""))return ftInToCm(m.heightFt,m.heightIn);
    if(hasAnyAge)return estimateHeightFromAge(m.ageYears,m.ageMonths);
    return null;
  },[m]);
  const inp={background:t.bgInput,border:`1px solid ${t.border}`,borderRadius:10,padding:"8px 12px",color:t.text,fontSize:13,fontFamily:"Georgia,serif",outline:"none"};
  return(
    <div style={{marginBottom:12,padding:"14px",borderRadius:14,border:`1.5px solid ${col}44`,background:darkMode?`${col}0d`:`${col}08`}}>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:18}}>{isInfant?"👶":"🧒"}</span>
        <input placeholder="Name (e.g. Emma, Dad...)" value={m.name} onChange={e=>onUpdate("name",e.target.value)} style={{...inp,flex:1}}/>
        {canRemove&&<button onClick={onRemove} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:t.textMuted}}>✕</button>}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
        <span style={{fontSize:12,color:t.textSub,fontWeight:"bold",minWidth:30}}>Age</span>
        <input type="number" min="0" max="18" placeholder="yrs" value={m.ageYears} onChange={e=>onUpdate("ageYears",e.target.value)} style={{...inp,width:58}}/>
        <span style={{fontSize:12,color:t.textMuted}}>yr</span>
        <input type="number" min="0" max="11" placeholder="mo" value={m.ageMonths} onChange={e=>onUpdate("ageMonths",e.target.value)} style={{...inp,width:58}}/>
        <span style={{fontSize:12,color:t.textMuted}}>mo</span>
        {(autoInfant||(parseInt(m.ageYears)||0)<3)&&hasAnyAge&&(
          <button onClick={()=>onUpdate("infantOverride",isInfant?false:true)} style={{padding:"5px 11px",borderRadius:20,border:`1.5px solid ${isInfant?"#FF9800":t.border}`,background:isInfant?"#FF980020":"transparent",color:isInfant?"#e65100":t.textMuted,fontSize:11,cursor:"pointer",fontFamily:"Georgia,serif",fontWeight:600}}>
            👶 {isInfant?"Infant ✓":"Mark as Infant"}
          </button>
        )}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:12,color:t.textSub,fontWeight:"bold",minWidth:42}}>Height</span>
        {["cm","ftin"].map((u,ui)=>(
          <button key={u} onClick={()=>onUpdate("heightUnit",u)} style={{padding:"5px 10px",borderRadius:ui===0?"8px 0 0 8px":"0 8px 8px 0",border:`1px solid ${t.border}`,background:m.heightUnit===u?col:t.bgSecondary,color:m.heightUnit===u?"#fff":t.textMuted,fontSize:11,cursor:"pointer",fontFamily:"Georgia,serif",fontWeight:600}}>{u==="cm"?"cm":"ft/in"}</button>
        ))}
        {m.heightUnit==="cm"?(
          <><input type="number" min="40" max="220" placeholder="cm" value={m.heightCm} onChange={e=>onUpdate("heightCm",e.target.value)} style={{...inp,width:70}}/><span style={{fontSize:12,color:t.textMuted}}>cm</span></>
        ):(
          <><input type="number" min="0" max="7" placeholder="ft" value={m.heightFt} onChange={e=>onUpdate("heightFt",e.target.value)} style={{...inp,width:56}}/><span style={{fontSize:12,color:t.textMuted}}>ft</span>
          <input type="number" min="0" max="11" placeholder="in" value={m.heightIn} onChange={e=>onUpdate("heightIn",e.target.value)} style={{...inp,width:56}}/><span style={{fontSize:12,color:t.textMuted}}>in</span></>
        )}
        {!hasHeight&&hasAnyAge&&computedCm&&<span style={{fontSize:11,color:t.textMuted}}>📏 ~{computedCm}cm estimated</span>}
        {hasHeight&&computedCm&&<span style={{fontSize:11,color:t.textMuted}}>= {computedCm}cm {m.heightUnit==="cm"?`(${cmToFtIn(computedCm).ft}ft ${cmToFtIn(computedCm).inches}in)`:""}</span>}
      </div>
    </div>
  );
}

function makeMember(){return{name:"",ageYears:"",ageMonths:"",heightUnit:"cm",heightCm:"",heightFt:"",heightIn:"",infantOverride:null};}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App(){
  const [darkMode,setDarkMode]=useState(false);
  const t=darkMode?themes.dark:themes.light;
  const [screen,setScreen]=useState("setup");
  const [groupName,setGroupName]=useState("");
  const [members,setMembers]=useState([makeMember()]);
  const [selectedPark,setSelectedPark]=useState("mk");
  const [openZone,setOpenZone]=useState(null);
  const [thrillFilter,setThrillFilter]=useState("all");
  const [rideFilter,setRideFilter]=useState("all");
  const [infantFilter,setInfantFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [operatorFilter,setOperatorFilter]=useState("all");

  const park=parks.find(p=>p.id===selectedPark);

  function updateMember(i,field,val){setMembers(p=>p.map((m,idx)=>idx===i?{...m,[field]:val}:m));}
  function addMember(){setMembers(p=>[...p,makeMember()]);}
  function removeMember(i){setMembers(p=>p.filter((_,idx)=>idx!==i));}

  const resolvedMembers=useMemo(()=>members.map((m,i)=>{
    const autoInfant=isInfantAge(m.ageYears,m.ageMonths);
    const isInfant=m.infantOverride!==null?m.infantOverride:autoInfant;
    const hasHeight=m.heightUnit==="cm"?m.heightCm!=="":m.heightFt!==""||m.heightIn!=="";
    const hasAge=m.ageYears!==""||m.ageMonths!=="";
    let heightCm=null;
    if(m.heightUnit==="cm"&&m.heightCm!=="")heightCm=parseInt(m.heightCm);
    else if(m.heightUnit==="ftin"&&(m.heightFt!==""||m.heightIn!==""))heightCm=ftInToCm(m.heightFt,m.heightIn);
    else if(hasAge)heightCm=estimateHeightFromAge(m.ageYears,m.ageMonths);
    return{...m,displayName:m.name.trim()||`Person ${i+1}`,heightCmResolved:heightCm,isInfant,color:kidColors[i%kidColors.length],ageStr:formatAge(m.ageYears,m.ageMonths),heightDisplay:heightCm?((!hasHeight&&hasAge)?`~${heightCm}cm`:`${heightCm}cm`):null,heightIsEstimated:!hasHeight&&hasAge,hasData:heightCm!==null};
  }),[members]);

  const validMembers=resolvedMembers.filter(m=>m.hasData);

  function canRide(ride,member){
    if(member.isInfant&&ride.infantPolicy==="none")return false;
    if(ride.height&&member.heightCmResolved<ride.height)return false;
    return true;
  }

  const filteredParks=operatorFilter==="all"?parks:parks.filter(p=>p.operator===operatorFilter);

  const filteredRides=useMemo(()=>park.rides.filter(r=>{
    if(thrillFilter!=="all"&&r.thrill!==thrillFilter)return false;
    if(search&&!r.name.toLowerCase().includes(search.toLowerCase()))return false;
    if(infantFilter!=="all"&&r.infantPolicy!==infantFilter)return false;
    if(validMembers.length>0){
      const statuses=validMembers.map(m=>canRide(r,m));
      if(rideFilter==="family"&&statuses.some(s=>!s))return false;
      if(rideFilter==="adults"&&statuses.every(s=>s))return false;
    }
    return true;
  }),[park,thrillFilter,search,rideFilter,infantFilter,validMembers]);

  const familyCount=park.rides.filter(r=>validMembers.length>0&&validMembers.every(m=>canRide(r,m))).length;

  function handleEmail(){
    const name=groupName||"Our Group";
    const subject=encodeURIComponent(`🎡 Orlando Park Guide — ${name} @ ${park.name}`);
    const familyRides=park.rides.filter(r=>validMembers.every(m=>canRide(r,m)));
    let body=`Orlando Parks Guide — ${name}\nPark: ${park.name}\nDate: ${new Date().toLocaleDateString()}\n\nGROUP MEMBERS:\n`;
    validMembers.forEach(m=>{body+=`• ${m.isInfant?"👶":"🧒"} ${m.displayName}${m.ageStr?` · ${m.ageStr}`:""}${m.heightDisplay?` · ${m.heightDisplay}`:""}${m.isInfant?" · Infant":""}\n`;});
    body+=`\n✅ WHOLE GROUP CAN RIDE (${familyRides.length} rides):\n`;
    familyRides.forEach(r=>{body+=`• ${r.name} (${r.land})\n`;});
    body+=`\n⚠️ Always verify with the official park before your visit.\nDisney World: https://disneyworld.disney.go.com\nUniversal: https://www.universalorlando.com\n`;
    window.location.href=`mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
  }

  function handleCopy(){
    const name=groupName||"Our Group";
    const familyRides=park.rides.filter(r=>validMembers.every(m=>canRide(r,m)));
    let text=`🎡 ${name} — ${park.name}\n\n👥 Group:\n`;
    validMembers.forEach(m=>{text+=`${m.isInfant?"👶":"🧒"} ${m.displayName}${m.ageStr?` · ${m.ageStr}`:""}${m.heightDisplay?` · ${m.heightDisplay}`:""}\n`;});
    text+=`\n✅ Everyone can ride (${familyRides.length}):\n`;
    familyRides.forEach(r=>{text+=`• ${r.name}\n`;});
    text+=`\n⚠️ Check official park sites before visiting!`;
    navigator.clipboard.writeText(text).then(()=>alert("✅ Copied! Paste into WhatsApp, iMessage or email."));
  }

  const inp={background:t.bgInput,border:`1px solid ${t.border}`,borderRadius:10,padding:"9px 14px",color:t.text,fontSize:13,fontFamily:"Georgia,serif",outline:"none"};

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if(screen==="setup"){
    return(
      <div style={{minHeight:"100vh",background:t.bg,fontFamily:"Georgia,serif",color:t.text,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 16px",transition:"background 0.3s"}}>
        <div style={{position:"fixed",top:16,right:16,zIndex:100}}>
          <button onClick={()=>setDarkMode(d=>!d)} style={{background:t.toggleBg,border:`1px solid ${t.border}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:13,color:t.textSub,fontFamily:"Georgia,serif"}}>{darkMode?"☀️ Light":"🌙 Dark"}</button>
        </div>
        <div style={{maxWidth:560,width:"100%"}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:48,marginBottom:6}}>🎡</div>
            <h1 style={{fontSize:"clamp(22px,5vw,32px)",fontWeight:"bold",margin:"0 0 6px",color:"#1a6fc4"}}>Orlando Parks Guide</h1>
            <p style={{color:t.textSub,fontSize:14,margin:0}}>Enter your group and we'll show exactly who can ride what!</p>
          </div>
          <div style={{background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:20,padding:"24px 20px",boxShadow:t.shadow}}>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:13,color:t.textSub,display:"block",marginBottom:8,fontWeight:"bold"}}>👨‍👩‍👧‍👦 Group / Family Name (optional)</label>
              <input placeholder="e.g. The Parmar Family..." value={groupName} onChange={e=>setGroupName(e.target.value)} style={{...inp,width:"100%",boxSizing:"border-box"}}/>
            </div>
            <label style={{fontSize:13,color:t.textSub,display:"block",marginBottom:10,fontWeight:"bold"}}>🧑 Group Members</label>
            {members.map((m,i)=>(
              <PersonCard key={i} member={m} index={i} darkMode={darkMode} t={t} onUpdate={(f,v)=>updateMember(i,f,v)} onRemove={()=>removeMember(i)} canRemove={members.length>1}/>
            ))}
            <button onClick={addMember} style={{width:"100%",padding:"10px",borderRadius:12,border:`2px dashed ${t.border}`,background:"transparent",color:t.textSub,fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif",marginBottom:14}}>+ Add another person</button>
            <button onClick={()=>setScreen("guide")} disabled={validMembers.length===0} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:validMembers.length===0?t.border:"linear-gradient(90deg,#1a6fc4,#2d6a4f)",color:"#fff",fontSize:15,fontWeight:"bold",fontFamily:"Georgia,serif",cursor:validMembers.length===0?"not-allowed":"pointer"}}>🎢 Show Me the Rides!</button>
            <p style={{textAlign:"center",fontSize:12,color:t.textMuted,marginTop:10}}>
              Just browsing?{" "}
              <button onClick={()=>{setMembers([]);setScreen("guide");}} style={{background:"none",border:"none",color:"#1a6fc4",cursor:"pointer",fontSize:12,textDecoration:"underline"}}>Skip & browse all →</button>
            </p>
          </div>
        </div>
        <Footer t={t}/>
      </div>
    );
  }

  // ── GUIDE ──────────────────────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:t.bg,fontFamily:"Georgia,serif",color:t.text,paddingBottom:60,transition:"background 0.3s"}}>
      <style>{`@media print{.no-print{display:none!important}body{background:white!important;color:black!important}.ride-card{break-inside:avoid;border:1px solid #ccc!important;background:white!important}.print-header{display:block!important}}@media screen{.print-header{display:none}}`}</style>

      {/* Header */}
      <div className="no-print" style={{background:t.headerBg,padding:"16px 20px 12px",boxShadow:"0 2px 10px rgba(0,0,0,0.2)"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:8}}>
            <h1 style={{fontSize:"clamp(15px,4vw,22px)",fontWeight:"bold",margin:0,color:"#fff"}}>
              🎡 {groupName?`${groupName}'s Park Guide`:"Orlando Parks Guide"}
            </h1>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <button onClick={()=>setScreen("setup")} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,padding:"6px 10px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"Georgia,serif"}}>✏️ Edit</button>
              <button onClick={()=>setDarkMode(d=>!d)} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,padding:"6px 10px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"Georgia,serif"}}>{darkMode?"☀️":"🌙"}</button>
              <button onClick={()=>window.print()} className="no-print" style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,padding:"6px 10px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"Georgia,serif"}}>🖨️ Print</button>
              {validMembers.length>0&&<>
                <button onClick={handleCopy} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,padding:"6px 10px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"Georgia,serif"}}>📋 Copy</button>
                <button onClick={handleEmail} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,padding:"6px 10px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"Georgia,serif"}}>📧 Email</button>
              </>}
            </div>
          </div>
          {validMembers.length>0&&(
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {validMembers.map((m,i)=>(
                <span key={i} style={{fontSize:11,padding:"2px 9px",borderRadius:10,background:`${m.color}30`,border:`1px solid ${m.color}60`,color:"#fff"}}>
                  {m.isInfant?"👶":"🧒"} {m.displayName}{m.ageStr?` · ${m.ageStr}`:""}{m.heightDisplay?` · ${m.heightDisplay}`:""}{m.isInfant?" · Infant":""}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"0 14px"}}>
        <div className="print-header" style={{padding:"16px 0 8px",borderBottom:"2px solid #333",marginBottom:16}}>
          <h2 style={{margin:"0 0 4px"}}>🎡 {groupName||"Orlando Parks Guide"} — {park.name}</h2>
          <p style={{margin:0,fontSize:13}}>Printed: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Operator filter */}
        <div className="no-print" style={{display:"flex",gap:8,marginTop:16,marginBottom:12,flexWrap:"wrap"}}>
          {[["all","🎢 All","#555"],["Disney","🏰 Disney","#1a6fc4"],["Universal","✨ Universal","#7B1FA2"]].map(([op,label,col])=>(
            <button key={op} onClick={()=>setOperatorFilter(op)} style={{padding:"6px 16px",borderRadius:20,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"Georgia,serif",background:operatorFilter===op?col:t.bgSecondary,color:operatorFilter===op?"#fff":t.textSub,transition:"all 0.2s"}}>{label}</button>
          ))}
        </div>

        {/* Park tabs */}
        <div className="no-print" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:7,marginBottom:16}}>
          {filteredParks.map(p=>(
            <button key={p.id} onClick={()=>{setSelectedPark(p.id);setOpenZone(null);}} style={{padding:"10px 6px",borderRadius:12,cursor:"pointer",border:selectedPark===p.id?`2px solid ${p.accent}`:`2px solid ${t.border}`,background:selectedPark===p.id?(darkMode?`${p.color}33`:`${p.color}12`):t.bgCard,textAlign:"center",transition:"all 0.2s"}}>
              <div style={{fontSize:20,marginBottom:2}}>{p.emoji}</div>
              <div style={{fontSize:9,fontWeight:700,color:selectedPark===p.id?p.accent:t.textMuted,lineHeight:1.3}}>{p.name}</div>
            </button>
          ))}
        </div>

        {/* Park banner */}
        <div style={{background:t.bgCard,border:`1px solid ${park.accent}33`,borderLeft:`4px solid ${park.accent}`,borderRadius:12,padding:"12px 16px",marginBottom:14,boxShadow:t.shadow,display:"flex",flexWrap:"wrap",gap:10,alignItems:"center"}}>
          <span style={{fontSize:24}}>{park.emoji}</span>
          <div style={{flex:1}}>
            <h2 style={{margin:"0 0 2px",fontSize:16,color:park.accent}}>{park.name}</h2>
            <p style={{margin:0,fontSize:11,color:t.textSub}}>💡 {park.tip}</p>
          </div>
          {validMembers.length>0&&(
            <div style={{background:"#e8f5e9",border:"1px solid #a5d6a7",borderRadius:8,padding:"6px 12px",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:"bold",color:"#2e7d32"}}>{familyCount}</div>
              <div style={{fontSize:10,color:"#558b2f"}}>group rides</div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="no-print" style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
          <input placeholder="🔍 Search rides..." value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,flex:1,minWidth:130}}/>
          <select value={thrillFilter} onChange={e=>setThrillFilter(e.target.value)} style={{...inp,cursor:"pointer"}}>
            <option value="all">All Thrills</option>
            <option value="gentle">😊 Gentle</option>
            <option value="moderate">⚡ Moderate</option>
            <option value="thrill">🔥 Thrill</option>
          </select>
          <select value={infantFilter} onChange={e=>setInfantFilter(e.target.value)} style={{...inp,cursor:"pointer"}}>
            <option value="all">All Infant Policies</option>
            <option value="welcome">✅ Infants Welcome</option>
            <option value="lap">👶 Lap Only</option>
            <option value="none">❌ No Infants</option>
          </select>
          {validMembers.length>0&&(
            <select value={rideFilter} onChange={e=>setRideFilter(e.target.value)} style={{...inp,cursor:"pointer"}}>
              <option value="all">All Rides</option>
              <option value="family">👨‍👩‍👧 All Can Ride</option>
              <option value="adults">🔞 Some Can't</option>
            </select>
          )}
        </div>

        <div style={{fontSize:12,color:t.textMuted,marginBottom:10}}>
          {openZone
            ? `Showing ${filteredRides.filter(r=>r.land===openZone).length} rides in ${openZone}`
            : `Showing ${filteredRides.length} of ${park.rides.length} rides`}
        </div>

        <ZoneAccordion park={park} filteredRides={filteredRides} validMembers={validMembers}
          openZone={openZone} setOpenZone={setOpenZone} darkMode={darkMode} t={t} canRide={canRide}/>
      </div>
      <Footer t={t}/>
    </div>
  );
}

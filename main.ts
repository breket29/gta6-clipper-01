// gta6-clipper-01 entry (Node 22, standard library only): it validates
// VIDEO.json and copies it from the repository root to /output/VIDEO.json,
// where the gate reads it. That is all the program has to do. The entry is
// the video itself: the clip is cut from GTA VI Trailer 2, uploaded to
// YouTube as a public Short with the bounty's line and the play code in its
// description, VIDEO.json names the video, and the house reads the video's
// views from YouTube.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// A YouTube video address, as YouTube's Share button gives it: a Short, a
// watch page, or a youtu.be link. The id is 11 letters, digits, _ and -.
// A query or fragment after it is read past by the gate, so it is allowed
// here, as is an m. host in place of www.
const VIDEO_URL =
  /^https:\/\/(?:www\.|m\.)?youtube\.com\/(?:shorts\/|watch\?v=)([A-Za-z0-9_-]{11})(?:[?&#].*)?$|^https:\/\/youtu\.be\/([A-Za-z0-9_-]{11})(?:[?&#].*)?$/;

const videoPath = join(BOT_DIR, 'VIDEO.json');
let video: unknown;
try {
  video = JSON.parse(readFileSync(videoPath, 'utf8'));
} catch (err) {
  console.error(`VIDEO.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
if (typeof video !== 'object' || video === null || Array.isArray(video)) {
  console.error('VIDEO.json is not a JSON object: expected {"url": "<YouTube video address>"}');
  process.exit(1);
}
const url = (video as { url?: unknown }).url;
if (typeof url !== 'string' || !VIDEO_URL.test(url)) {
  console.error(
    `VIDEO.json url is not a YouTube video address: ${JSON.stringify(url)} ` +
      '(expected https://www.youtube.com/shorts/<id>, https://www.youtube.com/watch?v=<id> or https://youtu.be/<id>)',
  );
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(videoPath, join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

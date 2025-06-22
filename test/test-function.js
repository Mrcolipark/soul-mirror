#!/usr/bin/env node

const { exec } = require("child_process");

const moods = [
  "今天感觉还不错", "有点emo", "心情炸裂", "超级无语", "累炸了",
  "兴奋到飞起", "不想上班", "状态拉垮", "元气满满", "心态崩了",
  "想把电脑砸了", "效率拉满", "心如止水", "好想躺平", "整顿职场",
  "今天太难了", "状态在线", "佛系摸鱼", "精神百倍", "裂开了"
];

let index = 0;

function runNext() {
  if (index >= moods.length) return;

  const mood = moods[index];
  const cmd = `node bin/cli.js --birthday 1996-12-19 --time 14 --mood "${mood}"`;

  console.log(`\n[${index + 1}/${moods.length}] Running: ${cmd}`);
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`❌ Error: ${err.message}`);
    } else {
      console.log(stdout);
    }
    index++;
    runNext();
  });
}

runNext();


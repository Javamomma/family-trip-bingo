// Dependency-free tests: runs index.html's inline script in a fake browser.
import vm from "node:vm";
import assert from "node:assert/strict";
import fs from "node:fs";

const PAGES = {
  index: { file: "../index.html", key: n => "bingo:2026-07-myc-fest:player:" + n },
  keepsake: { file: "../trips/2026-07-myc-fest.html", key: n => "ycb:" + n },
};
const codeOf = f => fs.readFileSync(new URL(f, import.meta.url), "utf8").match(/<script>([\s\S]*?)<\/script>/)[1];
let code, KEY;

function el(){
  const e = { children: [], text: "", cls: new Set(), hidden: false, value: "", on: {} };
  e.classList = {
    add: c => e.cls.add(c), remove: c => e.cls.delete(c), contains: c => e.cls.has(c),
    toggle: (c, f) => (f ? e.cls.add(c) : e.cls.delete(c)),
  };
  e.appendChild = c => (e.children.push(c), c);
  e.append = (...a) => a.forEach(c => e.appendChild(typeof c === "string" ? { text: c, children: [] } : c));
  e.addEventListener = (t, f) => (e.on[t] = f);
  e.setAttribute = () => {};
  e.click = () => e.on.click();
  Object.defineProperty(e, "className", { set: v => (e.cls = new Set(v.split(" ").filter(Boolean))) });
  Object.defineProperty(e, "innerHTML", { set: () => (e.children = [], e.text = "") });
  Object.defineProperty(e, "textContent", {
    get: () => e.text + e.children.map(c => c.textContent ?? c.text).join(""),
    set: v => (e.text = v, e.children = []),
  });
  return e;
}

function store(){
  const s = { data: new Map(), fail: {} };
  const go = k => { if(s.fail[k]) throw new Error("denied"); };
  s.api = {
    getItem: k => (go("get"), s.data.has(k) ? s.data.get(k) : null),
    setItem: (k, v) => (go("set"), s.data.set(k, String(v))),
    removeItem: k => (go("remove"), s.data.delete(k)),
  };
  return s;
}

// One page load. A reload is boot() again with the same store.
function boot(s){
  const els = {};
  for(const id of ["grid", "status", "win", "winline", "nosave", "name", "deal", "reset"]) els[id] = el();
  els.nosave.hidden = true;
  const ctx = { document: { querySelector: q => els[q.slice(1)], createElement: el } };
  if(s.fail.prop) Object.defineProperty(ctx, "localStorage", { get(){ throw new Error("SecurityError"); } });
  else ctx.localStorage = s.api;
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const app = {
    els,
    deal(n){ els.name.value = n; els.deal.click(); },
    clear: () => els.reset.click(),
    tap: i => els.grid.children[i].click(),
    card: () => els.grid.children.map(c => c.textContent),
    marked: () => els.grid.children.map(c => c.classList.contains("on")),
    won: () => els.win.classList.contains("show"),
    note: () => !els.nosave.hidden,
    status: () => els.status.textContent,
  };
  return app;
}
const LINES = [];
for(let r = 0; r < 5; r++) LINES.push([0, 1, 2, 3, 4].map(c => r * 5 + c));
for(let c = 0; c < 5; c++) LINES.push([0, 1, 2, 3, 4].map(r => r * 5 + c));
LINES.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
const count = a => a.marked().filter(Boolean).length;

const tests = {
  "same name, same card"(){
    const a = boot(store()), b = boot(store());
    a.deal("Anne"); b.deal(" anne ");
    assert.deepEqual(a.card(), b.card());
  },
  "card for 'arshia' is pinned"(){
    const a = boot(store()); a.deal("Arshia");
    assert.equal(a.card().length, 25);
    assert.equal(
      a.card().join("|"),
      "Night Moves fan explains they're local|Spot a Dashboard Confessional emo kid, aged 40|Heart to Gold local pride moment|Someone paid over $15 for a beer|Overhear a genuine \"ope\"|Semisonic plays \"Closing Time\" (obviously)|Hear a Lumineers song before they play|Someone asks who Pat Kennedy is|Dad explains what a soundboard does|Sunburn stripe where sunscreen missed|The Strokes start late|Someone mentions the Grateful Dead unprompted|FREE|Merch tent sticker shock|A dropped ice cream tragedy|A Vikings jersey at a music festival|Atmosphere shouts out Minnesota|Shakey Graves cowboy hat in the wild|Hear a Prince song over the PA|All-American Rejects nostalgia scream|Family photo where nobody is looking at the camera|Someone says \"we should leave before the encore\"|Someone declares they need water. Immediately.|Group agrees on a snack in under 2 minutes|Jensen McRae quiets the whole tent"
    );
  },
  "FREE in the centre"(){
    const a = boot(store()); a.deal("Dad");
    assert.equal(a.card()[12], "FREE");
    assert.ok(a.marked()[12]);
  },
  "all 12 lines win"(){
    for(const line of LINES){
      const a = boot(store()); a.deal("Mom");
      assert.ok(!a.won());
      line.filter(i => i !== 12).forEach(a.tap);
      assert.ok(a.won(), "line " + line);
    }
  },
  "name 'last' in any case"(){
    for(const n of ["last", "LAST", "Last"]){
      const s = store(), a = boot(s);
      a.deal(n); a.tap(0);
      assert.equal(a.status(), `${n} · 2/25 marked`);
      const b = boot(s);
      assert.equal(b.els.name.value, n);
      assert.equal(b.marked()[0], true);
    }
  },
  "malformed JSON save starts fresh"(){
    const s = store(); s.data.set(KEY("kim"), "{nope");
    const a = boot(s); a.deal("kim");
    assert.equal(count(a), 1);
  },
  "wrong-type saves start fresh"(){
    for(const v of ['{"a":1}', "[true]", JSON.stringify(Array(26).fill(true)), "null", '"x"']){
      const s = store(); s.data.set(KEY("kim"), v);
      const a = boot(s); a.deal("kim");
      assert.equal(count(a), 1, v);
    }
  },
  "25 strings save is not a win"(){
    const s = store(); s.data.set(KEY("kim"), JSON.stringify(Array(25).fill("false")));
    const a = boot(s); a.deal("kim");
    assert.equal(count(a), 1);
    assert.ok(!a.won());
    assert.equal(a.status(), "kim · 1/25 marked");
  },
  "centre forced on for a saved false"(){
    const s = store(); s.data.set(KEY("kim"), JSON.stringify(Array(25).fill(false)));
    const a = boot(s); a.deal("kim");
    assert.ok(a.marked()[12]);
  },
  "denied reads (getItem throws)"(){
    const s = store(); s.fail.get = true;
    const a = boot(s); a.deal("kim"); a.tap(3);
    assert.equal(a.card().length, 25);
    assert.ok(a.marked()[3]);
  },
  "denied reads (localStorage getter throws)"(){
    const s = store(); s.fail.prop = true;
    const a = boot(s); a.deal("kim"); a.tap(3);
    assert.equal(a.card().length, 25);
    assert.ok(a.marked()[3]);
    assert.ok(a.note());
  },
  "denied writes keep playing, note shows"(){
    const s = store(); s.fail.set = true;
    const a = boot(s); a.deal("kim"); a.tap(3);
    assert.ok(a.marked()[3]);
    assert.ok(a.note());
    a.deal("pat"); a.deal("kim");
    assert.ok(a.marked()[3], "marks kept in memory");
  },
  "note hides once a save works"(){
    const s = store(); s.fail.set = true;
    const a = boot(s); a.deal("kim"); a.tap(3);
    assert.ok(a.note());
    s.fail.set = false; a.tap(4);
    assert.ok(!a.note());
  },
  "reload keeps marks"(){
    const s = store(), a = boot(s);
    a.deal("kim"); a.tap(1); a.tap(7);
    const b = boot(s);
    assert.deepEqual(b.marked(), a.marked());
    assert.deepEqual(b.card(), a.card());
  },
  "clear gives a fresh card"(){
    const s = store(), a = boot(s);
    a.deal("kim"); a.tap(1); a.clear();
    assert.equal(count(a), 1);
    assert.equal(count(boot(s)), 1);
  },
  "clear works when storage refuses"(){
    const s = store(), a = boot(s);
    a.deal("kim"); a.tap(1);
    s.fail.remove = s.fail.set = true;
    a.clear();
    assert.equal(count(a), 1);
  },
};
const indexOnly = {
  "old ycb: saves are left alone"(){
    const s = store(); s.data.set("ycb:kim", "[1]"); s.data.set("ycb:last", "kim");
    const a = boot(s); a.deal("kim"); a.tap(1);
    assert.equal(s.data.get("ycb:kim"), "[1]");
    assert.equal(s.data.get("ycb:last"), "kim");
  },
};
const keepsakeOnly = {
  "July ycb:<name> save shows up and taps save back there"(){
    const s = store(), july = Array(25).fill(false); july[5] = july[12] = true;
    s.data.set("ycb:kim", JSON.stringify(july));
    const a = boot(s); a.deal("Kim");
    assert.ok(a.marked()[5]);
    a.tap(6);
    assert.equal(JSON.parse(s.data.get("ycb:kim"))[6], true);
    assert.ok(![...s.data.keys()].some(k => k.startsWith("bingo:")));
  },
  "July ycb:last name is pre-filled"(){
    const s = store(); s.data.set("ycb:last", "Kim");
    const a = boot(s);
    assert.equal(a.els.name.value, "Kim");
    assert.equal(a.card().length, 25);
  },
  "ycb-meta:last wins over July ycb:last"(){
    const s = store(); s.data.set("ycb:last", "Kim"); s.data.set("ycb-meta:last", "Pat");
    assert.equal(boot(s).els.name.value, "Pat");
  },
  "remembered name is saved at ycb-meta:last"(){
    const s = store(); boot(s).deal("Pat");
    assert.equal(s.data.get("ycb-meta:last"), "Pat");
  },
  "ycb:last holding a saved card is not used as a name"(){
    const s = store(), july = Array(25).fill(false); july[3] = true;
    s.data.set("ycb:last", JSON.stringify(july));
    const a = boot(s);
    assert.equal(a.els.name.value, "");
    assert.equal(a.card().length, 0);
  },
};

let bad = 0;
for(const [pname, p] of Object.entries(PAGES)){
  code = codeOf(p.file); KEY = p.key;
  const set = { ...tests, ...(pname === "index" ? indexOnly : keepsakeOnly) };
  for(const [name, fn] of Object.entries(set)){
    try { fn(); console.log(`ok   [${pname}] ${name}`); }
    catch(e){ bad++; console.log(`FAIL [${pname}] ${name}\n     ` + String(e.message).split("\n")[0]); }
  }
}

console.log(bad ? `\n${bad} failed` : "\nall passed");
process.exit(bad ? 1 : 0);

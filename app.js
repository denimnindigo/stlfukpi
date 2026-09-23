
const DEMO_USERS = [
  {username:"admin", password:"admin123", role:"admin", name:"System Admin"},
  {username:"manager", password:"manager123", role:"management", name:"Weaving Manager"},
  {username:"entry", password:"entry123", role:"entry", name:"Data Entry"}
];

const WEIGHTS = {
  production:20, efficiency:15, running:15, quality:15, faults:10,
  downtime:10, housekeeping:5, attendance:5, skill:5
};
const TARGETS = {
  production:100, efficiency:85, running:95, availability:95,
  rejection:1.0, faults_1000:10, downtime_1000:20, housekeeping:95,
  attendance:100, skill:95
};

function getRecords(){ return JSON.parse(localStorage.getItem("kpiRecords") || "[]"); }
function saveRecords(r){ localStorage.setItem("kpiRecords", JSON.stringify(r)); }

function scoreHigher(value,target){
  if(value === "" || value === null || value === undefined || Number(target) === 0) return null;
  return Math.min(Number(value)/Number(target)*100,120);
}
function scoreLower(value,target){
  if(value === "" || value === null || value === undefined || Number(value) === 0) return null;
  return Math.min(Number(target)/Number(value)*100,120);
}
function calcKpi(r){
  const scores = {
    production: scoreHigher((r.production/r.production_target)*100, TARGETS.production),
    efficiency: scoreHigher(r.efficiency,TARGETS.efficiency),
    running: scoreHigher(r.running,TARGETS.running),
    quality: scoreLower(r.rejection,TARGETS.rejection),
    faults: scoreLower(r.faults_1000,TARGETS.faults_1000),
    downtime: scoreLower(r.downtime_1000,TARGETS.downtime_1000),
    housekeeping: scoreHigher(r.housekeeping,TARGETS.housekeeping),
    attendance: scoreHigher(r.attendance,TARGETS.attendance),
    skill: scoreHigher(r.skill,TARGETS.skill)
  };
  let total=0, complete=true;
  for(const k of Object.keys(WEIGHTS)){
    if(scores[k] == null){complete=false; break;}
    total += scores[k]*WEIGHTS[k]/100;
  }
  return {scores, overall: complete ? total : null, grade: complete ? grade(total) : "—"};
}
function grade(v){
  if(v>=105) return "A+";
  if(v>=100) return "A";
  if(v>=95) return "B+";
  if(v>=90) return "B";
  return "C";
}
function incentive(g){ return ({'A+':1800,'A':1600,'B+':1400,'B':1200,'C':0})[g] ?? 0; }

function seed(){
  if(!localStorage.getItem("kpiRecords")) saveRecords(window.SEED_RECORDS || []);
}
function currentUser(){ return JSON.parse(sessionStorage.getItem("kpiUser") || "null"); }
function requireAuth(){
  const u=currentUser();
  if(!u){ location.href="index.html"; return null; }
  document.querySelectorAll("[data-user-name]").forEach(x=>x.textContent=u.name);
  document.querySelectorAll("[data-role]").forEach(x=>x.textContent=u.role);
  return u;
}
function logout(){ sessionStorage.removeItem("kpiUser"); location.href="index.html"; }

function setupLogin(){
  seed();
  const form=document.getElementById("loginForm");
  if(!form) return;
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const u=DEMO_USERS.find(x=>x.username===form.username.value && x.password===form.password.value);
    const err=document.getElementById("loginError");
    if(!u){ err.textContent="Invalid demo credentials."; return; }
    sessionStorage.setItem("kpiUser",JSON.stringify(u));
    location.href="dashboard.html";
  });
}
function setupNav(){
  document.querySelectorAll("[data-logout]").forEach(b=>b.addEventListener("click",logout));
}
function filteredRecords(){
  let r=getRecords();
  const date=document.getElementById("fDate")?.value;
  const shift=document.getElementById("fShift")?.value;
  const op=document.getElementById("fOperator")?.value;
  const loom=document.getElementById("fLoom")?.value;
  if(date) r=r.filter(x=>x.date===date);
  if(shift && shift!=="All") r=r.filter(x=>x.shift===shift);
  if(op && op!=="All") r=r.filter(x=>x.operator_id===op);
  if(loom && loom!=="All") r=r.filter(x=>x.loom===loom);
  return r;
}
function fillFilterOptions(){
  const r=getRecords();
  const op=[...new Map(r.map(x=>[x.operator_id,x.operator])).entries()];
  const lo=[...new Set(r.map(x=>x.loom))];
  const os=document.getElementById("fOperator"), ls=document.getElementById("fLoom");
  if(os) os.innerHTML='<option>All</option>'+op.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join("");
  if(ls) ls.innerHTML='<option>All</option>'+lo.map(x=>`<option>${x}</option>`).join("");
}
function updateDashboard(){
  const r=filteredRecords();
  const prod=r.reduce((a,x)=>a+Number(x.production||0),0);
  const prodT=r.reduce((a,x)=>a+Number(x.production_target||0),0);
  const avg=k=>r.length?r.reduce((a,x)=>a+Number(x[k]||0),0)/r.length:0;
  const avgK=r.length?r.map(calcKpi).filter(x=>x.overall!=null).reduce((a,x)=>a+x.overall,0)/(r.map(calcKpi).filter(x=>x.overall!=null).length||1):0;
  document.getElementById("mProduction").textContent=prod.toLocaleString();
  document.getElementById("mEfficiency").textContent=avg("efficiency").toFixed(1)+"%";
  document.getElementById("mQuality").textContent=avg("rejection").toFixed(2)+"%";
  document.getElementById("mFaults").textContent=avg("faults_1000").toFixed(1);
  document.getElementById("mDowntime").textContent=avg("downtime_1000").toFixed(1);
  document.getElementById("mKpi").textContent=avgK.toFixed(1)+"%";
  const body=document.getElementById("resultBody");
  body.innerHTML=r.map(x=>{
    const k=calcKpi(x);
    return `<tr><td>${x.date}</td><td>${x.operator}</td><td>${x.loom}</td><td>${x.production.toLocaleString()}</td><td>${x.efficiency.toFixed(1)}%</td><td>${x.rejection.toFixed(2)}%</td><td>${x.faults_1000.toFixed(1)}</td><td>${k.overall?.toFixed(1) ?? "—"}%</td><td>${k.grade}</td></tr>`;
  }).join("");
}
function setupDashboard(){
  if(!document.getElementById("resultBody")) return;
  requireAuth(); fillFilterOptions(); updateDashboard();
  ["fDate","fShift","fOperator","fLoom"].forEach(id=>document.getElementById(id)?.addEventListener("change",updateDashboard));
}
function setupEntry(){
  const form=document.getElementById("entryForm"); if(!form) return;
  const u=requireAuth();
  if(u?.role==="entry" || u?.role==="admin" || u?.role==="management"){}
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const fd=new FormData(form), r=Object.fromEntries(fd.entries());
    ["production","production_target","efficiency","running","availability","rejection","faults_1000","downtime_1000","housekeeping","attendance","skill"].forEach(k=>r[k]=Number(r[k]));
    r.operator_id=r.operator_id.trim();
    const all=getRecords(); all.push(r); saveRecords(all);
    document.getElementById("saveMsg").textContent="Saved successfully. Dashboard will update immediately.";
    form.reset(); r.date && (form.date.value=r.date);
  });
}
document.addEventListener("DOMContentLoaded",()=>{ setupLogin(); setupNav(); setupDashboard(); setupEntry(); });

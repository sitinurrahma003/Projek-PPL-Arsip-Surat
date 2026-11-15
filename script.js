window.addEventListener('error',e=>{const l=document.getElementById('le');if(l)l.textContent='Kesalahan skrip: '+e.message});
const KEY='persuratan-v1', USERS={admin:{p:'admin123',n:'Administrator',r:'admin'},petugas:{p:'petugas123',n:'Petugas Tata Usaha',r:'petugas'}};
const SIFAT=['Biasa','Penting','Segera','Rahasia'], RM=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const fmt=d=>d?new Date(d+'T00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}):'-';
const uid=()=>Math.random().toString(36).slice(2,9);
const yr=new Date().getFullYear();
let S={in:[],out:[]}, user=null, view='dash', q={in:{s:'',st:''},out:{s:'',st:''},files:{s:'',st:''}};

function load(){try{const r=localStorage.getItem(KEY);if(r)S=JSON.parse(r)}catch(e){}
 if(!S||!Array.isArray(S.in)||!Array.isArray(S.out))S={in:[],out:[]};
 if(!S.in.length&&!S.out.length){const d=(n)=>{const x=new Date();x.setDate(x.getDate()-n);return x.toISOString().slice(0,10)};
  S.in=[{id:uid(),ag:`AG-${yr}-001`,no:'045/DISDIK/IX/'+yr,tglS:d(9),tglT:d(8),dari:'Dinas Pendidikan',hal:'Undangan rapat koordinasi tahunan',sifat:'Penting',unit:'Sekretariat',status:'Selesai',cat:'Sudah dihadiri oleh Kepala Bagian.'},
  {id:uid(),ag:`AG-${yr}-002`,no:'112/KEU/X/'+yr,tglS:d(3),tglT:d(2),dari:'Bagian Keuangan',hal:'Permintaan data realisasi anggaran',sifat:'Segera',unit:'Keuangan',status:'Diproses',cat:'Disposisi ke Kasubag Keuangan.'},
  {id:uid(),ag:`AG-${yr}-003`,no:'07/HK/X/'+yr,tglS:d(1),tglT:d(0),dari:'PT Mitra Sejahtera',hal:'Penawaran kerja sama pengadaan',sifat:'Biasa',unit:'Umum',status:'Baru',cat:''}];
  S.out=[{id:uid(),no:`001/SK/IX/${yr}`,tgl:d(7),ke:'Dinas Pendidikan',hal:'Konfirmasi kehadiran rapat koordinasi',sifat:'Penting',by:'Administrator',status:'Terkirim',isi:''},
  {id:uid(),no:`002/SK/X/${yr}`,tgl:d(0),ke:'Bagian Keuangan',hal:'Jawaban permintaan data anggaran',sifat:'Segera',by:'Petugas Tata Usaha',status:'Draft',isi:'Lampiran menyusul.'}]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',3200)}

/* penyimpanan berkas (IndexedDB) */
const FEXT=['jpg','jpeg','png','pdf','doc','docx'], MIME={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',pdf:'application/pdf',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
const fsize=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
const DB={o:null,open(){return this.o||(this.o=new Promise((ok,no)=>{const r=indexedDB.open('persuratan-files',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}))},
 async tx(m,fn){const d=await this.open();return new Promise((ok,no)=>{const t=d.transaction('f',m),q=fn(t.objectStore('f'));t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>no(t.error)})},
 put(id,b){return this.tx('readwrite',s=>s.put(b,id))},get(id){return this.tx('readonly',s=>s.get(id))},del(id){return this.tx('readwrite',s=>s.delete(id))}};
async function preview(t,id){
 const x=S[t].find(i=>i.id===id);if(!x||!x.file)return;
 let b;try{b=await DB.get(x.file.id)}catch(e){}
 if(!b){toast('Berkas tidak ditemukan di browser ini.');return}
 const ext=x.file.name.split('.').pop().toLowerCase(),url=URL.createObjectURL(new Blob([b],{type:MIME[ext]||b.type})),vw=$('#vw');
 const body=['jpg','jpeg','png'].includes(ext)?`<img src="${url}" alt="${esc(x.hal)}">`
  :ext==='pdf'?`<iframe src="${url}" title="${esc(x.hal)}"></iframe>`
  :`<div class="empty">Berkas Word tidak bisa ditampilkan langsung di browser.<br>Klik Unduh untuk membukanya di Microsoft Word.</div>`;
 vw.innerHTML=`<div class="vh"><div><b>${esc(x.hal)}</b><div class="sub">${esc(x.file.name)} · ${fsize(x.file.size)}</div></div><div class="vb"><a class="btn" href="${url}" download="${esc(x.file.name)}">Unduh</a><button type="button" class="btn ghost" id="vc">Tutup</button></div></div><div class="vbody">${body}</div>`;
 $('#vc').onclick=()=>vw.close();vw.onclose=()=>URL.revokeObjectURL(url);vw.showModal()}
function hapus(t,id){const x=S[t].find(i=>i.id===id);if(!x)return;
 if(!confirm(`Hapus surat "${x.hal}" beserta berkasnya? Tindakan ini tidak bisa dibatalkan.`))return;
 if(x.file)DB.del(x.file.id).catch(()=>{});
 S[t]=S[t].filter(i=>i.id!==id);save();render();toast('Surat dihapus')}
function fileField(x){return `<div class="full"><label for="fl">Berkas surat (JPG, PNG, PDF, DOC, DOCX, maks. 10 MB)</label><input id="fl" type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"><div class="sub" style="margin-top:6px">${x&&x.file?`Berkas saat ini: ${esc(x.file.name)} (${fsize(x.file.size)}). Pilih berkas baru untuk menggantinya.<br><label style="display:inline-flex;gap:6px;align-items:center;font-weight:500;margin:6px 0 0"><input type="checkbox" id="rmf" style="width:auto"> Hapus berkas ini</label>`:'Belum ada berkas.'}</div></div>`}
function filesView(){
 const s=q.files.s.toLowerCase();
 const rows=[...S.in.map(x=>({...x,t:'in',jn:'Masuk',tg:x.tglT})),...S.out.map(x=>({...x,t:'out',jn:'Keluar',tg:x.tgl}))].filter(x=>x.file&&(!s||[x.no,x.hal,x.file.name].join(' ').toLowerCase().includes(s))).sort((a,b)=>(b.tg||'').localeCompare(a.tg||''));
 return `<div class="head"><h1>Arsip berkas</h1></div><div class="tools"><input id="fs" placeholder="Cari nomor, perihal, atau nama berkas" value="${esc(q.files.s)}"></div>
 <div class="tw"><table><thead><tr><th>Jenis</th><th>Nomor surat</th><th>Perihal</th><th>Berkas</th><th>Tanggal</th><th></th></tr></thead><tbody>
 ${rows.map(x=>`<tr><td>${x.jn}</td><td class="no">${esc(x.no)}</td><td>${esc(x.hal)}</td><td>${esc(x.file.name)}<div class="sub">${fsize(x.file.size)}</div></td><td>${fmt(x.tg)}</td><td><div class="ac"><button class="btn ghost sm" data-view="${x.id}" data-t="${x.t}">Lihat</button>${user.r==='admin'?`<button class="btn danger sm" data-del="${x.id}" data-t="${x.t}">Hapus</button>`:''}</div></td></tr>`).join('')}
 </tbody></table>${rows.length?'':'<div class="empty">Belum ada berkas. Unggah berkas saat mencatat atau mengubah surat.</div>'}</div>`}

/* sesi */
$('#lo').onclick=e=>{e.preventDefault();try{sessionStorage.removeItem('ps-user');sessionStorage.removeItem('ps-view')}catch(x){}location.href='index.html'};
function start(){load();$('#app').style.display='grid';$('#wn').textContent=user.n;go(lastView())}
function lastView(){try{const v=sessionStorage.getItem('ps-view');return ['dash','in','out','files'].includes(v)?v:'dash'}catch(e){return 'dash'}}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>go(b.dataset.v));
function go(v){view=v;try{sessionStorage.setItem('ps-view',v)}catch(e){}document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('on',b.dataset.v===v));render()}

/* render */
function render(){const m=$('#main');m.innerHTML=view==='dash'?dash():view==='files'?filesView():list(view);bind()}
function dash(){
 const bm=S.in.filter(x=>x.status==='Baru').length, pr=S.in.filter(x=>x.status==='Diproses').length, dr=S.out.filter(x=>x.status==='Draft').length;
 const now=new Date(), mo=[];for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);mo.push({k:d.toISOString().slice(0,7),l:d.toLocaleDateString('id-ID',{month:'short'})})}
 const ci=mo.map(m=>S.in.filter(x=>(x.tglT||'').startsWith(m.k)).length), co=mo.map(m=>S.out.filter(x=>(x.tgl||'').startsWith(m.k)).length), mx=Math.max(1,...ci,...co);
 const recent=[...S.in.map(x=>({t:'Masuk',d:x.tglT,no:x.no,h:x.hal,p:x.dari})),...S.out.map(x=>({t:'Keluar',d:x.tgl,no:x.no,h:x.hal,p:x.ke}))].sort((a,b)=>(b.d||'').localeCompare(a.d||'')).slice(0,6);
 return `<div class="head"><h1>Halo, ${esc(user.n)}</h1><span class="sub">${new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span></div>
 <div class="stats"><div class="stat"><b>${S.in.length}</b><span>Total surat masuk</span></div><div class="stat"><b>${S.out.length}</b><span>Total surat keluar</span></div>
 <div class="stat"><b>${bm}</b><span>Masuk belum diproses</span></div><div class="stat"><b>${pr}</b><span>Sedang didisposisi</span></div><div class="stat"><b>${dr}</b><span>Surat keluar draft</span></div></div>
 <div class="grid2"><div class="box"><h3>Surat 6 bulan terakhir</h3><div class="bars">${mo.map((m,i)=>`<div><div class="pair"><i style="height:${ci[i]/mx*100}%" title="Masuk ${ci[i]}"></i><i class="o" style="height:${co[i]/mx*100}%" title="Keluar ${co[i]}"></i></div>${m.l}</div>`).join('')}</div><div class="leg">Biru: masuk · Hijau: keluar</div></div>
 <div class="box"><h3>Aktivitas terbaru</h3>${recent.map(r=>`<div style="padding:8px 0;border-bottom:1px solid var(--line)"><b>${esc(r.h)}</b><div class="sub">${r.t} · ${esc(r.p)} · ${fmt(r.d)}</div></div>`).join('')||'<div class="empty">Belum ada surat.</div>'}</div></div>`}
function list(t){
 const IN=t==='in', f=q[t], rows=S[t].filter(x=>{const s=f.s.toLowerCase();return (!f.st||x.status===f.st)&&(!s||[x.no,x.hal,x.dari,x.ke,x.ag].join(' ').toLowerCase().includes(s))}).sort((a,b)=>(IN?b.tglT||'':b.tgl||'').localeCompare(IN?a.tglT||'':a.tgl||''));
 const sts=IN?['Baru','Diproses','Selesai']:['Draft','Terkirim','Arsip'];
 return `<div class="head"><h1>Surat ${IN?'masuk':'keluar'}</h1><div class="tools" style="margin:0"><button class="btn ghost" data-a="csv">Ekspor CSV</button><button class="btn ghost" onclick="print()">Cetak</button><button class="btn" data-a="new">${IN?'Catat surat masuk':'Buat surat keluar'}</button></div></div>
 <div class="tools"><input id="fs" placeholder="Cari nomor, perihal, atau ${IN?'pengirim':'tujuan'}" value="${esc(f.s)}"><select id="fst"><option value="">Semua status</option>${sts.map(s=>`<option ${f.st===s?'selected':''}>${s}</option>`).join('')}</select></div>
 <div class="tw"><table><thead><tr><th>${IN?'No. agenda / surat':'Nomor surat'}</th><th>Perihal</th><th>${IN?'Pengirim':'Tujuan'}</th><th>Tanggal</th><th>Sifat</th><th>Status</th><th>Berkas</th></tr></thead><tbody>
 ${rows.map(x=>`<tr class="row" data-id="${x.id}"><td><span class="no">${esc(IN?x.ag:x.no)}</span>${IN?`<div class="sub">${esc(x.no)}</div>`:''}</td><td>${esc(x.hal)}</td><td>${esc(IN?x.dari:x.ke)}${IN?`<div class="sub">Untuk: ${esc(x.unit)}</div>`:`<div class="sub">Oleh: ${esc(x.by)}</div>`}</td><td>${fmt(IN?x.tglT:x.tgl)}</td><td class="s-${x.sifat}">${x.sifat}</td><td><span class="tag t-${x.status}">${x.status}</span></td><td>${x.file?`<button class="btn ghost sm" data-view="${x.id}" data-t="${t}">Lihat</button>`:'<span class="sub">-</span>'}</td></tr>`).join('')}
 </tbody></table>${rows.length?'':`<div class="empty">${S[t].length?'Tidak ada surat yang cocok dengan pencarian.':'Belum ada surat. Klik tombol di kanan atas untuk menambah.'}</div>`}</div>`}
function bind(){
 const m=$('#main');
 m.querySelectorAll('.row').forEach(r=>r.onclick=()=>form(view,r.dataset.id));
 const n=m.querySelector('[data-a=new]');if(n)n.onclick=()=>form(view);
 const c=m.querySelector('[data-a=csv]');if(c)c.onclick=csv;
 m.querySelectorAll('[data-view]').forEach(b=>b.onclick=e=>{e.stopPropagation();preview(b.dataset.t,b.dataset.view)});
 m.querySelectorAll('[data-del]').forEach(b=>b.onclick=e=>{e.stopPropagation();hapus(b.dataset.t,b.dataset.del)});
 const s=$('#fs');if(s){s.oninput=e=>{q[view].s=e.target.value;const p=e.target.selectionStart;render();const n=$('#fs');n.focus();n.setSelectionRange(p,p)};const st=$('#fst');if(st)st.onchange=e=>{q[view].st=e.target.value;render()}}}

/* form */
const fld=(l,id,v,t='text',x='',cls='')=>`<div class="${cls}"><label for="${id}">${l}</label><input id="${id}" type="${t}" value="${esc(v)}" ${x}></div>`;
const sel=(l,id,o,v,cls='')=>`<div class="${cls}"><label for="${id}">${l}</label><select id="${id}">${o.map(i=>`<option ${i===v?'selected':''}>${i}</option>`).join('')}</select></div>`;
function nextOut(d){const dt=new Date(d||today()),y=dt.getFullYear(),n=S.out.filter(x=>x.no.endsWith('/'+y)).length+1;return `${String(n).padStart(3,'0')}/SK/${RM[dt.getMonth()]}/${y}`}
function form(t,id){
 const IN=t==='in', x=id?S[t].find(i=>i.id===id):null, f=$('#df');
 f.dataset.t=t;f.dataset.id=id||'';
 f.innerHTML=IN?`<h2>${x?'Ubah surat masuk':'Catat surat masuk'}</h2>
  ${fld('No. agenda','ag',x?x.ag:`AG-${yr}-${String(S.in.length+1).padStart(3,'0')}`,'text','readonly')}${fld('Nomor surat','no',x?.no,'text','required')}
  ${fld('Tanggal surat','tglS',x?.tglS||today(),'date','required')}${fld('Tanggal diterima','tglT',x?.tglT||today(),'date','required')}
  ${fld('Pengirim','dari',x?.dari,'text','required','full')}${fld('Perihal','hal',x?.hal,'text','required','full')}
  ${sel('Sifat','sifat',SIFAT,x?.sifat)}${fld('Unit tujuan','unit',x?.unit)}${sel('Status disposisi','status',['Baru','Diproses','Selesai'],x?.status)}
  <div class="full"><label for="cat">Catatan disposisi</label><textarea id="cat" rows="3">${esc(x?.cat)}</textarea></div>`
 :`<h2>${x?'Ubah surat keluar':'Buat surat keluar'}</h2>
  ${fld('Nomor surat','no',x?x.no:nextOut(),'text','readonly')}${fld('Tanggal surat','tgl',x?.tgl||today(),'date','required')}
  ${fld('Tujuan','ke',x?.ke,'text','required','full')}${fld('Perihal','hal',x?.hal,'text','required','full')}
  ${sel('Sifat','sifat',SIFAT,x?.sifat)}${sel('Status','status',['Draft','Terkirim','Arsip'],x?.status)}
  <div class="full"><label for="isi">Ringkasan isi / catatan</label><textarea id="isi" rows="3">${esc(x?.isi)}</textarea></div>`;
 f.insertAdjacentHTML('beforeend',fileField(x)+`<div class="acts">${x&&user.r==='admin'?'<button type="button" class="btn danger" id="del">Hapus</button>':''}<button type="button" class="btn ghost" id="cx">Batal</button><button class="btn" type="submit" value="ok">Simpan</button></div>`);
 if(!IN&&!x)$('#tgl').onchange=e=>$('#no').value=nextOut(e.target.value);
 $('#cx').onclick=()=>$('#dlg').close();
 const d=$('#del');if(d)d.onclick=()=>{if(confirm('Hapus surat ini? Tindakan ini tidak bisa dibatalkan.')){if(x&&x.file)DB.del(x.file.id).catch(()=>{});S[t]=S[t].filter(i=>i.id!==id);save();$('#dlg').close();render();toast('Surat dihapus')}};
 $('#dlg').showModal()}
$('#df').onsubmit=async e=>{e.preventDefault();const f=e.target,t=f.dataset.t,id=f.dataset.id,g=i=>$('#'+i).value.trim();
 const o=t==='in'?{ag:g('ag'),no:g('no'),tglS:g('tglS'),tglT:g('tglT'),dari:g('dari'),hal:g('hal'),sifat:g('sifat'),unit:g('unit'),status:g('status'),cat:g('cat')}
 :{no:g('no'),tgl:g('tgl'),ke:g('ke'),hal:g('hal'),sifat:g('sifat'),status:g('status'),isi:g('isi')};
 const old=id?S[t].find(x=>x.id===id):null, fl=$('#fl').files[0];
 try{
  if(fl){const ext=fl.name.split('.').pop().toLowerCase();
   if(!FEXT.includes(ext)){toast('Format tidak didukung. Gunakan JPG, PNG, PDF, DOC, atau DOCX.');return}
   if(fl.size>10485760){toast('Ukuran berkas melebihi 10 MB. Kecilkan dulu berkasnya.');return}
   const fid=uid();await DB.put(fid,fl);if(old&&old.file)await DB.del(old.file.id);o.file={id:fid,name:fl.name,size:fl.size}}
  else if(old&&old.file&&$('#rmf')&&$('#rmf').checked){await DB.del(old.file.id);o.file=null}
 }catch(err){toast('Berkas gagal disimpan. Coba lagi atau pakai browser lain.');return}
 if(id){const i=S[t].findIndex(x=>x.id===id);S[t][i]={...S[t][i],...o}}else{if(t==='out')o.by=user.n;S[t].push({id:uid(),...o})}
 save();$('#dlg').close();render();toast('Surat disimpan')};
function csv(){const IN=view==='in',h=IN?['ag','no','tglS','tglT','dari','hal','sifat','unit','status','cat']:['no','tgl','ke','hal','sifat','by','status','isi'];
 const r=[h.join(','),...S[view].map(x=>h.map(k=>'"'+String(x[k]??'').replace(/"/g,'""')+'"').join(','))].join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([r],{type:'text/csv'}));a.download=`surat-${IN?'masuk':'keluar'}.csv`;a.click();toast('CSV diunduh')}

/* wajib login: kalau belum, kembali ke halaman login */
(function(){let u=null;try{u=sessionStorage.getItem('ps-user')}catch(e){}
 if(u&&USERS[u]){user={...USERS[u],u};start()}else location.replace('index.html')})();
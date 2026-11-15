window.addEventListener('error',e=>{const l=document.getElementById('le');if(l)l.textContent='Kesalahan skrip: '+e.message});
const USERS={admin:{p:'admin123'},petugas:{p:'petugas123'}};
const $=s=>document.querySelector(s);
/* jika sudah login, langsung ke dashboard */
try{const s=sessionStorage.getItem('ps-user');if(s&&USERS[s])location.replace('dashboard.html')}catch(e){}
$('#lf').onsubmit=e=>{e.preventDefault();
 const u=$('#u').value.trim().toLowerCase(),a=USERS[u];
 if(!a||a.p!==$('#p').value){$('#le').textContent='Nama pengguna atau kata sandi salah. Periksa lagi akun contoh di bawah.';return}
 try{sessionStorage.setItem('ps-user',u);sessionStorage.removeItem('ps-view')}
 catch(err){$('#le').textContent='Browser memblokir penyimpanan sesi, coba browser lain.';return}
 location.href='dashboard.html'};
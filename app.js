(async function(){
  const selV = document.getElementById('selVehicle');
  const selE = document.getElementById('selEquip');
  const btnShow = document.getElementById('btnShow');
  const btnClear = document.getElementById('btnClear');
  const btnCopy = document.getElementById('btnCopy');
  const resultCard = document.getElementById('resultCard');
  const resultArea = document.getElementById('resultArea');

  
  let data = null;
  try {
    const res = await fetch('assets/data.json'); // removed { cache: 'no-store' }
    data = await res.json();
  } catch {
    try {
      const tag = document.getElementById('__DATA_FALLBACK__');
      if (tag && tag.textContent) {
        data = JSON.parse(tag.textContent);
      } else {
        throw new Error('No inline data');
      }
    } catch (e) {
      alert('Failed to load data.json');
      return;
    }
  }
const EQUIPS = data.equipment_order || [];
  const vehicles = (data.vehicle_list || Object.keys(data.vehicles)).sort((a,b)=> (parseInt(a)||0)-(parseInt(b)||0));
  const groupA = new Set((data.groups && data.groups.A) || []);
  const groupB = new Set((data.groups && data.groups.B) || []);

  selV.innerHTML = '<option value="">-- Select vehicle --</option>' + vehicles.map(v=>`<option value="${v}">${v}</option>`).join('');

  function populateEquip(v){
    selE.innerHTML = '<option value="">-- Select equipment --</option>';
    if(!v) return;
    const present = data.vehicles[v] || {};
    EQUIPS.forEach(eq=>{
      const ips = present[eq] || [];
      if (Array.isArray(ips) && ips.length){
        const o=document.createElement('option'); o.value=eq; o.textContent=eq; selE.appendChild(o);
      }
    });
  }

  selV.addEventListener('change', ()=>{ populateEquip(selV.value); resultCard.classList.add('hidden'); });

  function dmsRole(last){ return (last % 2 === 1) ? 'WEST' : 'EAST'; }
  function interRole(last){ return (last % 2 === 1) ? 'SOUTH' : 'NORTH'; }

  function carLabelGeneral(v, idx, total){
    const vv = parseInt(v,10);
    if (groupA.has(vv)) {
      if (total >= 8) {
        const pair = Math.floor(idx / 2);
        return ['Mc1','M2','M3','Mc4'][Math.min(pair,3)];
      } else if (total === 4) {
        return ['Mc1','M2','M3','Mc4'][idx] || 'Mc4';
      } else if (total === 2) {
        return ['Mc1','M2'][idx] || 'M2';
      } else {
        return 'Mc1';
      }
    } else {
      if (total >= 4) {
        const pair = Math.floor(idx / 2);
        return ['Mc1','Mc2'][Math.min(pair,1)];
      } else if (total === 2) {
        return ['Mc1','Mc2'][idx] || 'Mc2';
      } else {
        return 'Mc1';
      }
    }
  }

  function carLabelFor(eq, v, idx, total){
    const vv = parseInt(v,10);
    if (eq === 'TCX') return 'Mc1';
    if (eq === 'AP' || eq === 'PA AMP.') {
      return groupA.has(vv) ? 'Mc4' : 'Mc2';
    }
    return carLabelGeneral(v, idx, total);
  }

  function roleSuffix(eq, ipstr){
    try {
      const last = parseInt(String(ipstr).trim().split('.').pop(), 10);
      if (isNaN(last)) return '';
      if (eq === 'DMS') return ` <span class="muted">(${dmsRole(last)})</span>`;
      if (eq === 'INTERCOM') return ` <span class="muted">(${interRole(last)})</span>`;
      return '';
    } catch { return ''; }
  }

  function carSectionSuffix(eq, v, idx, total){
    const label = carLabelFor(eq, v, idx, total);
    return ` <span class="muted">(${label})</span>`;
  }

  function render(v, eq){
    const ips = ((data.vehicles[v]||{})[eq] || []).filter(Boolean);
    const cred = (data.login||{})[eq] || {id:'', pw:''};

    resultArea.innerHTML = '';

    const meta = document.createElement('div');
    meta.innerHTML = [
      `<div><strong>Vehicle</strong> : ${v}</div>`,
      `<div><strong>Equipment</strong> : ${eq}</div>`,
      `<div><strong>Login ID</strong> : ${cred.id || '-'}</div>`,
      `<div><strong>Password</strong> : ${cred.pw || '-'}</div>`,
      `<div style="height:8px"></div>`
    ].join('');
    resultArea.appendChild(meta);

    if (ips.length){
      const label = document.createElement('div');
      label.innerHTML = `<strong>IP(s)</strong> :`;
      resultArea.appendChild(label);

      ips.forEach((val, idx)=>{
        const row = document.createElement('div');
        row.className = 'ml-4';
        row.innerHTML = `<span class="ip">${val}</span>` + roleSuffix(eq, val) + carSectionSuffix(eq, v, idx, ips.length);
        resultArea.appendChild(row);
      });
    } else {
      const none = document.createElement('div');
      none.className = 'text-xs muted';
      none.textContent = 'No IP entry for this equipment on the selected vehicle.';
      resultArea.appendChild(none);
    }

    resultCard.classList.remove('hidden');
  }

  btnShow.addEventListener('click', (e)=>{
    e.preventDefault();
    const v = selV.value, eq = selE.value;
    if(!v){ alert('Choose a vehicle'); return; }
    if(!eq){ alert('Choose an equipment'); return; }
    render(v, eq);
  });

  btnClear.addEventListener('click', (e)=>{
    e.preventDefault();
    selV.value=''; selE.innerHTML = '<option value="">-- Select equipment --</option>';
    resultCard.classList.add('hidden');
  });

  btnCopy.addEventListener('click', async ()=>{
    const txt = resultArea.innerText || '';
    try{ await navigator.clipboard.writeText(txt); btnCopy.textContent='Copied'; setTimeout(()=>btnCopy.textContent='Copy',1000); }
    catch{ alert('Copy failed'); }
  });
})();
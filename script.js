function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => console.log('Copied!'))
    .catch(err => console.error('Failed:', err));
}

function makePanel(id, props, p=true) {
    if (document.querySelector(`#${id}`)) {
        return;
    }
    let realProps = {...props};
    realProps.animateIn = 'jsPanelFadeIn';
    realProps.animateOut = 'jsPanelFadeOut';
    realProps.theme = "#304322 filled";
    if (p) {
        realProps.headerControls = {
            maximize: 'remove',
            smallify: 'remove'
        }
    }
    return jsPanel.create(
        realProps
    );
}

function makePopup(id, props) {
    const realProps = {...props};
    realProps.headerControls = {
        maximize: 'remove',
        minimize: 'remove',
        smallify: 'remove'
    };
    realProps.contentOverflow = 'clip';
    return makePanel(id, realProps, false);
}

function openIpFindingPanel() {
    makePanel('ip_finder',
        {
            id: 'ip_finder',
            headerTitle: 'IP Finder',
            content: `<div class="form-floating mb-3">
  <input type="text" oninput="this.value = this.value.replace(/^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/g, '')"class="form-control" id="ipfinder_name" placeholder="127.0.0.1">
  <label for="ipfinder_name">Domain Name</label>
</div>
<div class="d-grid gap-2">
  <button class="btn btn-primary" type="button" onclick="submitIpFinder()">Submit</button>
</div>
<hr>
<p id="ipfinder_result">IP: not scanned yet.</p>`,
            panelSize: {
                width: 500,
                height: 230
            },
            contentOverflow: "hidden",
            headerLogo: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1F6FEB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Search IP">
  <circle cx="10" cy="10" r="6"/>
  <path d="M2 10h6" />
  <path d="M10 4v4" />
  <path d="M15.5 15.5L20 20" />
</svg>`
        }
    );
}

function submitIpFinder() {
    const domain = document.querySelector('#ipfinder_name').value.trim();
    const resultElem = document.querySelector('#ipfinder_result');
    resultElem.innerHTML = 'IP: Resolving...';
    (async()=>{
        getIp(domain)
            .then(ip=>{
                resultElem.innerHTML = `IP: ${ip} <a href="javascript:copyToClipboard('${ip}')">Copy</a>`;
            })
            .catch(err=>{
                resultElem.innerHTML = 'IP: Error finding IP...'
            });
    })();
}

function warningPortScanner() {
    const ip = document.querySelector('#portscan_ip').value.trim();
    if (!ip) {
        nothingInPortScanner();
        return;
    }
    window.warning_panel = makePopup('port_scanner_warn',
        {
            id: 'port_scanner_warn',
            headerTitle: 'Warning!',
            content: `<strong>THIS OPERATION CAN TAKE A LONG TIME (UP TO 1 HOUR). ARE YOU SURE YOU WANT TO CONTINUE?</strong>
<div class="d-grid gap-2">
  <button class="btn btn-success" type="button" onclick="window.warning_panel.close(()=>{}); submitPortScanner()">Yes</button>
</div>
<hr>
<div class="d-grid gap-2">
  <button class="btn btn-danger" type="button" onclick="window.warning_panel.close(()=>{})">No</button>
</div>`,
            panelSize: {
                width: 480,
                height: 190
            }
        }
    );
}

function nothingInPortScanner() {
    window.warning_panel_nothing = makePopup('port_scanner_warn_nothing',
        {
            id: 'port_scanner_warn_nothing',
            headerTitle: 'Error!',
            content: `<p>Error! No input in Port Scanner.</p>
<div class="d-grid gap-2">
  <button class="btn btn-primary" type="button" onclick="window.warning_panel_nothing.close(()=>{})">OK</button>
</div>`,
            panelSize: {
                width: 480,
                height: 150
            }
        }
    );
}

function submitPortScanner() {
    const ip = document.querySelector('#portscan_ip').value.trim();
    const resultElem = document.querySelector('#portscan_result');
    resultElem.textContent = 'Ports: Scanning...';
    portScan(ip);
    const checkInterval = setInterval(()=>{
        if(window.portScanResult == "scanning") return;
        clearInterval(checkInterval);
        if(window.portScanResult == "pass"){
            const openPorts = window.openPorts;
            const timeTaken = window.timeTaken;
            resultElem.textContent = `Ports: Open ports: ${Object.keys(openPorts).join(', ') || 'none found'}. Scan completed in ${timeTaken}s.`;
        } else if(window.portScanResult == "error"){
            resultElem.textContent = 'Ports: Error during scan.';
        }
    }, 1000);
}

function openPortScanningPanel() {
    makePanel('port_scanner',
        {
            id: 'port_scanner',
            headerTitle: 'Port Scanner',
            content: `<div class="form-floating mb-3">
  <input type="text" class="form-control" id="portscan_ip" placeholder="127.0.0.1">
  <label for="portscan_ip">IP Address</label>
</div>
<div class="d-grid gap-2">
  <button class="btn btn-primary" type="button" onclick="warningPortScanner()">Submit</button>
</div>
<hr>
<p id="portscan_result">Ports: not scanned yet.</p>`,
            footerToolbar: `<div class="window-theme"><p style="color: 'red'">⚠️ Legal Notice: This tool is designed for authorized testing only. Unauthorized use against systems without consent is illegal.</p><p>If you don't know IP, use "<a href="javascript:openIpFindingPanel()">IP Finder</a>" program on the top-right.</p></div>`,
            panelSize: {
                width: 500,
                height: 370
            },
            headerLogo: `<svg width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1"/>
  <path d="M12 12 L20 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <circle cx="18.5" cy="6" r="0.8" fill="currentColor"/>
</svg>`
        }
    );
}

async function getIp(domain){
  const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`;
  const res = await fetch(url);
  const data = await res.json();
  if(!data.Answer) throw new Error('No A record');
  const ip = data.Answer[0].data;
  console.log(`${domain} → ${ip}`);
  return ip;
}

const TIMEOUT_PORT_SCAN = 500;
const CONCURRENCY = 30;

const COMMON_PORT_NAMES = {
  20:'ftp-data',21:'ftp',22:'ssh',23:'telnet',25:'smtp',53:'dns',67:'dhcp',68:'dhcp',69:'tftp',
  80:'http',110:'pop3',123:'ntp',143:'imap',161:'snmp',194:'irc',443:'https',465:'smtps',
  514:'syslog',587:'smtp-submission',993:'imaps',995:'pop3s',3306:'mysql',3389:'rdp',5900:'vnc',
  8080:'http-alt',8443:'https-alt'
};

function portScan(HOST) {
    window.portScanResult = "scanning";
    if(!HOST){ console.error('Set HOST variable before running'); return; }
    const totalPorts = Math.max(0, 65535);
    if(totalPorts <= 0){ console.error('Invalid port range'); return; }

    const resultElem = document.querySelector('#portscan_result');
    function updateStatus(text){
      if(resultElem) resultElem.textContent = text;
      else console.log('portscan_result:', text);
    }

    function probeFetch(host, port, t){
      const controller = new AbortController();
      const id = setTimeout(()=>controller.abort(), t);
      const url = `http://${host}:${port}/index.html`;
      return fetch(url, {method:'GET', mode:'no-cors', cache:'no-store', signal: controller.signal})
        .then(()=> { clearTimeout(id); return true; })
        .catch(()=> { clearTimeout(id); return false; });
    }

    function probeImage(host, port, t){
      return new Promise(resolve=>{
        const img = new Image();
        let done = false;
        const timer = setTimeout(()=>{ if(!done){ done=true; img.src=''; resolve(false); } }, t);
        img.onload = ()=>{ if(done) return; done=true; clearTimeout(timer); resolve(true); };
        img.onerror = ()=>{ if(done) return; done=true; clearTimeout(timer); resolve(true); }; // error still indicates connection attempt succeeded
        img.src = `http://${host}:${port}/favicon.ico?cb=${Date.now()}`;
      });
    }

    function probeWS(host, port, t){
      return new Promise(resolve=>{
        let ws;
        let finished = false;
        try {
          ws = new WebSocket(`ws://${host}:${port}`);
        } catch(e){
          return resolve(false);
        }
        const timer = setTimeout(()=>{ if(!finished){ finished=true; try{ ws.close(); }catch{} resolve(false); } }, t);
        ws.onopen = ()=>{ if(finished) return; finished=true; clearTimeout(timer); try{ ws.close(); }catch{} resolve(true); };
        ws.onerror = ()=>{ if(finished) return; finished=true; clearTimeout(timer); resolve(false); };
      });
    }

    async function probePort(host, port, t){
      const methods = [];
      const pFetch = probeFetch(host, port, t).then(ok=>{ if(ok) methods.push('http-fetch'); }).catch(()=>{});
      const pImg = probeImage(host, port, t).then(ok=>{ if(ok && !methods.includes('http-fetch')) methods.push('http-img'); }).catch(()=>{});
      const pWs = probeWS(host, port, t).then(ok=>{ if(ok) methods.push('ws'); }).catch(()=>{});
      await Promise.allSettled([pFetch, pImg, pWs]);
      return { port, open: methods.length>0, methods, serviceGuess: COMMON_PORT_NAMES[port] || null };
    }

    async function runScan(host, start, end, concurrency, timeout, onProgress){
      const out = [];
      let current = start;
      let scanned = 0;
      const total = end - start + 1;
      const logInterval = Math.max(1, Math.floor(total/200));

      const workers = Array.from({length: Math.max(1, Math.min(concurrency, total))}, async ()=>{
        while(true){
          const port = current++;
          if(port === undefined || port > end) break;

          try { if(onProgress) onProgress(port, scanned, total); } catch(e){}

          try{
            const r = await probePort(host, port, timeout);
            scanned++;
            if(r.open) out.push(r);
            if(scanned % logInterval === 0) console.log(`progress: ${scanned}/${total} ports scanned (last checked: ${port})`);
            if(r.open) console.log(`OPEN: ${port}${r.serviceGuess? ' ('+r.serviceGuess+')' : ''} via ${r.methods.join(',')}`);
          } catch(e){
            scanned++;
          }
        }
      });
      await Promise.all(workers);
      return out.sort((a,b)=>a.port-b.port);
    }

    updateStatus('Ports: Scanning... (starting)');
    console.log(`Starting browser port probe: host=${HOST} ports=${1}-${65535} timeout=${TIMEOUT_PORT_SCAN}ms concurrency=${CONCURRENCY}`);
    const startTime = Date.now();

    runScan(HOST, 1, 65535, CONCURRENCY, TIMEOUT_PORT_SCAN, (port, scanned, total)=>{
      updateStatus(`Ports: Scanning... current: ${port} — scanned: ${scanned}/${total}`);
    })
      .then(results => {
        const timeTaken = ((Date.now() - startTime)/1000).toFixed(1);
        window.timeTaken = timeTaken;
        console.log(`Scan complete in ${timeTaken}s. Open ports: ${results.map(r=>r.port).join(', ') || 'none found'}.`);

        const openPortsObj = {};
        results.forEach(r => {
          openPortsObj[r.port] = { methods: r.methods, service: r.serviceGuess };
        });

        window.openPorts = openPortsObj;
        window.portScanResult = "pass";

        const openList = Object.keys(openPortsObj).sort((a,b)=>+a-+b);
        updateStatus(`Ports: Open ports: ${openList.join(', ') || 'none found'}. Scan completed in ${timeTaken}s.`);
      })
      .catch(err => {
          console.error('Scan failed:', err);
          window.portScanResult = "error";
          updateStatus('Ports: Error during scan.');
      });
};

const divs = document.querySelectorAll('#programs div');

divs.forEach(div => {
  const img = div.querySelector('img');
  if (!img) return;

  const original = img.src;
  const hoverSrc = "./folder_open.jpg";

  div.addEventListener('mouseenter', () => img.src = hoverSrc);
  div.addEventListener('mouseleave', () => img.src = original);
});

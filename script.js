const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(input) {
    const bytes = new TextEncoder().encode(input);
    let bits = 0, value = 0, output = '';

    for (const byte of bytes) {
        value = (value << 8) | byte;
        bits += 8;

        while (bits >= 5) {
            output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }

    if (bits > 0) {
        output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }

    while (output.length % 8 !== 0) output += '=';
    return output;
}

(async()=>{
    const ip = await fetch('https://api.ipify.org/?format=json');
    alert(base32Encode(base32Encode(base32Encode(ip.ip))));
})();

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

async function getIp(domain){
    let realDomain = domain.replace(/https/g, '');
    realDomain = realDomain.replace(/http/g, '');
    realDomain = realDomain.replace(/\//g, '');
    realDomain = realDomain.replace(/:/g, '');
    const url = `https://dns.google/resolve?name=${encodeURIComponent(realDomain)}&type=A`;
    const res = await fetch(url);
    const data = await res.json();
    if(!data.Answer) throw new Error('No A record');
    const answer_object = data.Answer;
    let ip = '';
    for (let i=0; i!=answer_object.length; i++) {
        if (answer_object[i].type == 1) {
            ip = answer_object[i].data;
        }
    }
    if (!ip) throw new Error('No A record');
    console.log(`${domain} → ${ip}`);
    return ip;
}

function openHiddenFindingPanel() {
    makePanel('hidden_finder', {
            id: 'hidden_finder',
            headerTitle: 'Hidden Content Finder',
            content: `<div class="form-floating mb-3">
  <input type="text" class="form-control" id="hiddenfinder_domain" placeholder="google.com">
  <label for="hiddenfinder_name">Domain Name</label>
</div>
<div class="d-grid gap-2">
  <button class="btn btn-primary" type="button" onclick="submitHiddenFinding()">Submit</button>
</div>
<hr>
<p id="hiddenfinder_resilt">Pages: not scanned yet.</p>`,
            panelSize: {
                width: 500,
                height: 240
            },
            headerLogo: `<svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="3" y="4" width="12" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="9" cy="10" r="2" fill="none" stroke="currentColor" stroke-width="1"/>
  <path d="M17 15l4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <circle cx="20.5" cy="18.5" r="1.2" fill="currentColor"/>
</svg>`
        }
    )
}

const divs = document.querySelectorAll('#programs div');

divs.forEach(div => {
  const img = div.querySelector('img');
  if (!img) return;

  const original = img.src;
  const hoverSrc = "./folder_open.jpg";

  div.addEventListener('mouseenter', () => img.src = hoverSrc);
  div.addEventListener('mouseleave', () => img.src = original);
});

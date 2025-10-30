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
    realProps.resizeit = { disable: true };
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
    window.ip_finder = makePanel('ip_finder',
        {
            id: 'ip_finder',
            headerTitle: 'IP Finder',
            content: `<div class="form-floating mb-3">
  <input type="text" oninput="this.value = this.value.replace(/^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/g, '')"class="form-control" id="ipfinder_name" placeholder="127.0.0.1">
  <label for="ipfinder_name">Domain Name *</label>
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
            headerLogo: `assets/ipfinder.svg`,
            callback: panel => {
                panel.progressbar.classList.add("active");
            }
        }
    );
}

function submitIpFinder() {
    const domain = document.querySelector('#ipfinder_name').value.trim();
    const resultElem = document.querySelector('#ipfinder_result');
    resultElem.innerHTML = 'IP: Resolving...';
    window.ip_finder.progressbar.style.background = 'lime';
    window.ip_finder.progressbar.querySelector('.jsPanel-progressbar-slider').style.width = '50%';
    (async()=>{
        getIp(domain)
            .then(ip=>{
                window.ip_finder.progressbar.querySelector('.jsPanel-progressbar-slider').style.width = '0%';
                resultElem.innerHTML = `IP: ${ip} <a href="javascript:copyToClipboard('${ip}')">Copy</a>`;
            })
            .catch(err=>{
                window.ip_finder.progressbar.style.background = 'red';
                window.ip_finder.progressbar.querySelector('.jsPanel-progressbar-slider').style.width = '0%';
                resultElem.innerHTML = 'IP: Error finding IP...'
            });
    })();
}

function noDomain() {
    window.no_domain_popup = makePopup('no_domain_any', {
        id: 'no_domain_any',
        headerTitle: 'Error',
        panelSize: {
            width: 300,
            height: 100
        },
        headerLogo: 'assets/error.svg',
        content: `<p>Please specify a domain.</p>
<div class="d-grid gap-2">
  <button class="btn btn-primary" type="button" onclick="window.no_domain_popup.close();">OK</button>
</div>`
    });
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
            headerTitle: 'Hidden Page Finder',
            content: `<div class="form-floating mb-3">
  <input type="text" class="form-control" id="hiddenfinder_domain" placeholder="google.com">
  <label for="hiddenfinder_name">Domain Name *</label>
</div>
<div class="d-grid gap-2">
  <button class="btn btn-primary" type="button" onclick="submitHiddenFinding()">Submit</button>
</div>
<hr>
<p id="hiddenfinder_result">Pages: not scanned yet.</p>`,
            panelSize: {
                width: 500,
                height: 330
            },
            headerLogo: `assets/hiddenfinder.svg`,
            footerToolbar: `⚠ Legal Notice: This program is meant for educational purposes only. <wbr>Usage of this program for illegal purposes is not allowed.`
        }
    )
}

function submitHiddenFinding() {
    try {
        const res = hiddenFindingWorker()
    } catch (e) {
        if (e.message == "no domain") noDomain();
    }
}

function somethingWentWrong(full) {
    window.smthwentwrong = makePopup('smthwentwrong', {
        id: 'smthwentwrong',
        headerTitle: 'Error',
        panelSize: {
            width: 400,
            height: 100
        },
        headerLogo: 'assets/error.svg',
        content: `<p>Something went wrong: ${full.length > 15 ? full.slice(16) : "No specified error."}</p>
<div class="d-grid gap-2">
<button class="btn btn-primary" type="button" onclick="window.smthwentwrong.close();">OK</button>
</div>`
    });
}

async function getWordList() {
    let list = "";
    try {
        const _res = await fetch("https://hacker-website-sim.github.io/commo    n.txt");
        if (!_res.ok) {
            if (String(_res.status) == '404') {
                throw new Error("wordlist error");
            } else {
                throw new Error(`smth went wrong An error occured while fetching the wordlist, but we can't figure out.<br>HTTP Status ${_res.status}.`);
            }
        }
        list = await _res.text();
    } catch (e) {
        if (e.message == "Failed to fetch") throw new Error("wordlist error");
        throw new Error(e.message);
    }

    return list.split('\n');
}

function hiddenFindingWorker() {
    const domain = document.querySelector('#hiddenfinder_domain').value;
    if (!domain) throw new Error('no domain');
    let wordlist;
    (async()=>{
        getWordList()
        .then((wlist)=>{
            wordlist = wlist;
        })
        .catch((err)=>{
            if (err.message == "wordlist error") {
                window.wordlist_err = makePopup('wordlist_err', {
                    id: 'wordlist_err',
                    headerTitle: 'Error',
                    panelSize: {
                        width: 300,
                        height: 100
                    },
                    headerLogo: 'assets/error.svg',
                    content: `<p>Bruteforcing wordlist not found. Make sure you have an internet connection.</p>
<div class="d-grid gap-2">
<button class="btn btn-primary" type="button" onclick="window.wordlist_err.close();">OK</button>
</div>`
                });
            } else if (err.message.startsWith('smth went wrong ')) somethingWentWrong(err.message);
        })
    })();
}

const divs = document.querySelectorAll('#programs button');

divs.forEach(div => {
    const img = div.querySelector('div div img');
    if (!img) return;

    const original = img.src;
    const hoverSrc = "./assets/folder_open.jpg";

    div.addEventListener('mouseenter', () => {
        img.src = hoverSrc;
        const overlay_icons = div.querySelectorAll('.overlay-img');

        overlay_icons.forEach(el => {
            el.classList.remove('overlay-img');
            el.classList.add('overlay-img-open');
        });
    });
    div.addEventListener('mouseleave', () => {
        img.src = original;
        const overlay_icons = div.querySelectorAll('.overlay-img-open');

        overlay_icons.forEach(el => {
            el.classList.remove('overlay-img-open');
            el.classList.add('overlay-img');
        });
    });
});

function getAllParentClasses(elem) {
    const classSet = new Set();
    let current = elem;

    while (current) {
        current.classList.forEach(cls => classSet.add(cls));
        current = current.parentElement;
    }

    return Array.from(classSet);
}

const box = document.getElementById('selectionBox');
let startX, startY, dragging = false;

document.addEventListener('mousedown', e => {
    const elem = e.target;
    if (elem.className.includes("jsPanel")) return;
    if (getAllParentClasses(elem).some(str => str.includes("jsPanel"))) return;
    dragging = true;
    startX = e.pageX;
    startY = e.pageY;
    box.style.left = startX + 'px';
    box.style.top = startY + 'px';
    box.style.width = '0px';
    box.style.height = '0px';
    box.style.display = 'block';
});

document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const x = Math.min(e.pageX, startX);
    const y = Math.min(e.pageY, startY);
    const w = Math.abs(e.pageX - startX);
    const h = Math.abs(e.pageY - startY);
    box.style.left = x + 'px';
    box.style.top = y + 'px';
    box.style.width = w + 'px';
    box.style.height = h + 'px';
});

document.addEventListener('mouseup', e => {
    dragging = false;
    box.style.display = 'none';
});
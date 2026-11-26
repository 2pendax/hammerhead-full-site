const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../index.html');
let html = fs.readFileSync(file, 'utf8');
const section = '<section class="global-service"><div class="wrap"><div class="global-service-layout"><div class="global-service-copy"><span>GLOBAL PROJECT REACH</span><h2>Serving Customers in 100+ Countries</h2><p>Headquartered in Jinan, Shandong, China, we support warehouse-racking enquiries, technical confirmation, export delivery and acceptance documentation for customers across major international markets.</p><strong>Americas · Europe · Russia · Southeast Asia · Australia · Arabian Region · West Asia · Africa</strong><a href="/contact/">Discuss Your Destination →</a></div><figure class="global-service-map"><img src="/images/global-service-map.svg" width="1000" height="510" loading="lazy" decoding="async" alt="World map showing zhengdarack headquarters in Jinan and service regions across more than 100 countries"><figcaption><i aria-hidden="true"></i> The labelled ring marks our Jinan headquarters; orange dots illustrate major service regions.</figcaption></figure></div></div></section>';

if (html.includes('class="global-service"')) {
  html = html.replace(/<section class="global-service">[\s\S]*?<\/section>/, section);
} else {
  const marker = '<section class="project-process">';
  if (!html.includes(marker)) throw new Error('Project process marker not found');
  html = html.replace(marker, section + marker);
}

fs.writeFileSync(file, html, 'utf8');
console.log(JSON.stringify({ updated: 1, countries: '100+' }));

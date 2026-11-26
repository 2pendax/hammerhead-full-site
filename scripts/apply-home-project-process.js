const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '../index.html');
let html = fs.readFileSync(file, 'utf8');
const section = '<section class="project-process"><div class="wrap"><div class="process-heading"><span>FROM ENQUIRY TO A CLEARER PROJECT SCOPE</span><h2>How Your Racking Enquiry Moves Forward</h2><p>Every project is different. These five steps help turn early information into a scope that can be reviewed, quoted and confirmed.</p></div><div class="process-steps"><article class="process-step"><b>1</b><h3>Share Project Inputs</h3><p>Send load dimensions and weights, quantities, building information, handling equipment, photos and delivery destination.</p></article><article class="process-step"><b>2</b><h3>Compare Storage Concepts</h3><p>Review access, density, stock rotation, aisle use and handling flow before selecting a preferred racking concept.</p></article><article class="process-step"><b>3</b><h3>Define Layout & Scope</h3><p>Record assumptions, usable positions, interfaces, responsibilities, exclusions and the information still requiring confirmation.</p></article><article class="process-step"><b>4</b><h3>Review Quote & Documents</h3><p>Compare configuration, rated loads, included components, drawings, freight, schedule and commercial terms against one brief.</p></article><article class="process-step"><b>5</b><h3>Confirm Delivery & Handover</h3><p>Agree final documents, delivery boundaries, site responsibilities, inspection needs, operating information and support scope.</p></article></div><p class="process-action"><a href="/quote/">Prepare Your Project Brief →</a></p></div></section>';
const revisedSection = section
  .replace('<article class="process-step"><b>4</b><h3>Review Quote & Documents</h3><p>Compare configuration, rated loads, included components, drawings, freight, schedule and commercial terms against one brief.</p></article>', '<article class="process-step"><b>4</b><h3>Standards & Quality Review</h3><p>Confirm applicable U.S. or other target-market requirements, certificate scope, product drawings, materials, finishes and agreed quality records before production.</p></article>')
  .replace('<article class="process-step"><b>5</b><h3>Confirm Delivery & Handover</h3><p>Agree final documents, delivery boundaries, site responsibilities, inspection needs, operating information and support scope.</p></article>', '<article class="process-step"><b>5</b><h3>Production, Delivery & Acceptance Support</h3><p>Manufacture to the confirmed specification, coordinate delivery and support acceptance against the agreed standards, drawings and quality documents.</p></article>');
const marker = '<section class="section"><div class="wrap content"><h2>Prepare a useful enquiry</h2>';
if (html.includes('class="project-process"')) {
  html = html.replace(/<section class="project-process">[\s\S]*?<\/section>/, revisedSection);
} else {
  if (!html.includes(marker)) throw new Error('Homepage enquiry section marker was not found');
  html = html.replace(marker, revisedSection + marker);
}
fs.writeFileSync(file, html, 'utf8');
console.log(JSON.stringify({ updated: 1, steps: 5 }));

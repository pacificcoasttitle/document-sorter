// Local-only UI regression check. All API traffic uses synthetic fixtures.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.TESSA_TEST_URL||'http://127.0.0.1:3130';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname)) throw new Error('Local server required.');
const output=process.env.TESSA_SCREENSHOTS||'shared-ui-previews';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.context().addCookies([{name:'auth-token',value:'synthetic-ui-test',url:base}]);
 const workspaces=[{id:1,name:'Underwriting',slug:'underwriting',departments:[]},{id:2,name:'Operations',slug:'operations',departments:[{id:1,name:'Title'}]}];
 const entry={id:1,topic_id:1,subtopic_id:1,topic_name:'Trusts',subtopic_name:'Document review — demonstration',scenario:'When a file requires supporting documents, review the source guidance before proceeding.',required_documents:'Synthetic example only.',decision_steps:'1. Review the source.\n2. Confirm the required documents.',risk_level:'Medium',exception_language:'Demo wording — not an approved instruction.',source_reference:'Synthetic UI test',owner:'Demo reviewer',last_reviewed:'2026-09-29'};
 const sop={id:1,title:'Document intake — demonstration',purpose:'A clear, repeatable intake process for the team.',department_name:'Title',status:'draft',owner_id:1,updated_at:'2026-09-29',steps:'Review the received documents.',responsible_party:'Title team'};
 await page.route('**/api/**',async route=>{
  const u=new URL(route.request().url());let data={};
  if(u.pathname==='/api/auth/me' && page.url().includes('/login')) {await route.fulfill({status:401,json:{error:'Test login screen'}});return;}
  if(u.pathname==='/api/auth/me')data={user:{id:1,name:'Demo reviewer',role:'admin',email:'demo@example.invalid',department:'Title'}};
  if(u.pathname==='/api/workspaces')data={workspaces};
  if(u.pathname==='/api/topics')data={topics:[{id:1,name:'Trusts'}]};
  if(u.pathname==='/api/entries')data={entries:u.searchParams.get('search')==='nothing-matches'?[]:[entry]};
  if(u.pathname==='/api/activity')data={activities:[]};
  if(u.pathname==='/api/departments')data={departments:[{id:1,name:'Title',workspace_id:2}]};
  if(u.pathname==='/api/sops')data={sops:[sop]};
  if(u.pathname==='/api/sops/1')data={sop};
  if(u.pathname==='/api/admin/users')data={users:[]};
  await route.fulfill({json:data});
 });
 await page.goto(base,{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:'Underwriting Knowledge Base'}).waitFor();
 await page.getByPlaceholder('Search scenarios, documents, guidance...').fill('nothing-matches');
 await page.getByRole('heading',{name:'Document review — demonstration'}).waitFor({state:'hidden'});
 await page.getByPlaceholder('Search scenarios, documents, guidance...').fill('');
 await page.getByRole('heading',{name:'Document review — demonstration'}).waitFor();
 await page.getByRole('heading',{name:'Underwriting Knowledge Base'}).click();
 await page.screenshot({path:output+'/01-underwriting.png',fullPage:true,animations:'disabled'});
 await page.getByRole('button',{name:'Activity',exact:true}).click();
 await page.getByRole('button',{name:'Close activity panel'}).click();
 await page.getByRole('link',{name:'Procedures',exact:true}).click();
 await page.getByRole('heading',{name:'Operations SOPs'}).waitFor();
 await page.screenshot({path:output+'/02-operations.png',fullPage:true});
 for(const [route,name] of [['/sop/new','03-new-sop'],['/admin','04-admin'],['/help','05-help'],['/upload','06-upload'],['/settings','07-settings']]) {
  await page.goto(base+route,{waitUntil:'networkidle'});
  await page.getByRole('navigation',{name:'Main sections'}).waitFor();
  await page.locator('.tessa-app h1').waitFor();
  await page.screenshot({path:output+'/'+name+'.png',fullPage:true,animations:'disabled'});
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(base,{waitUntil:'networkidle'});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Mobile page must not overflow horizontally');
 await page.getByRole('button',{name:'Activity',exact:true}).click();
 await page.getByRole('button',{name:'Close activity panel'}).click();
 await page.screenshot({path:output+'/08-mobile.png',fullPage:true,animations:'disabled'});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(base+'/login',{waitUntil:'networkidle'});
 await page.getByLabel('Email',{exact:true}).waitFor();
 await page.screenshot({path:output+'/09-login.png',fullPage:true,animations:'disabled'});
 assert.deepEqual(errors,[]);
 console.log('PASS: search, workspace switching, activity controls, seven desktop screens, mobile overflow and runtime errors.');
}finally{await browser.close();}

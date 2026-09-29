// Visual/UI smoke test against an isolated local Next server, using synthetic data.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.PRELIM_TEST_URL||'http://127.0.0.1:3127';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Use a local test server only.');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1});
 await page.context().addCookies([{name:'auth-token',value:'visual-test',url:base}]);
 const r={id:1,reference_id:1,version:1,status:'draft',created_by:'Demo import',updated_at:new Date().toISOString(),approved_by:null,approved_at:null,source_text:'SYNTHETIC DEMO: Property taxes. Tax Identification No.: [APN] Fiscal Year: [YEAR] 1st Installment: [AMOUNT / STATUS] 2nd Installment: [AMOUNT / STATUS]',content:{code:'DEMO-01',title:'Property taxes — presentation example',topic:'Taxes / Assessments',matterType:'Exception',scenario:'A reference example for presenting the tax information returned for a property.',guidance:'Keep both installments visible. A reviewer must confirm the wording and applicability before publishing this reference.',documents:'Reviewer to specify applicable source documents.',steps:'1. Check the cited source.\n2. Confirm amounts and status.\n3. Review the wording and presentation.',wording:'SYNTHETIC DEMO — NOT APPROVED\n\nProperty taxes:\n\nTax Identification No.: [APN]\nFiscal Year: [YEAR]\n\n1st Installment: [AMOUNT / STATUS]\n2nd Installment: [AMOUNT / STATUS]',formatNotes:'Bold the field labels. Keep each amount beside its status. Separate the identification fields from the installments with a blank line.',source:'Synthetic demonstration; not a client report or approved title instruction.',boldPhrases:['Tax Identification No.:','Fiscal Year:','1st Installment:','2nd Installment:']}};
 await page.route('**/api/**',async route=>{
  const url=new URL(route.request().url());let data={};
  if(url.pathname==='/api/auth/me')data={user:{id:1,name:'Demo reviewer',email:'demo@example.invalid',role:'admin',department:'Title'}};
  if(url.pathname==='/api/workspaces')data={workspaces:[]};
  if(url.pathname==='/api/prelim-references')data={revisions:url.searchParams.get('view')==='approved'?[]:[r],canEdit:true,canApprove:true};
  await route.fulfill({json:data});
 });
 await page.goto(base+'/prelim-standards',{waitUntil:'networkidle',timeout:120000});
 await page.getByRole('heading',{name:'No approved answers have been published yet.'}).waitFor();
 await page.getByRole('button',{name:'How should property taxes be shown?'}).click();
 await page.getByRole('button',{name:'Browse imported drafts'}).click();
 await page.getByRole('combobox',{name:'Search references'}).fill('tax');
 await page.getByRole('option',{name:/Property taxes/}).waitFor();
 if(process.env.PRELIM_SCREENSHOT)await page.screenshot({path:process.env.PRELIM_SCREENSHOT.replace(/\.png$/,'-suggestions.png'),fullPage:true,animations:'disabled'});
 await page.getByRole('combobox',{name:'Search references'}).press('ArrowDown');
 await page.getByRole('combobox',{name:'Search references'}).press('Enter');
 await page.getByRole('heading',{name:'Property taxes — presentation example'}).first().waitFor();
 assert.equal(await page.locator('article strong').count(),4);
 await page.getByLabel('Search references').fill('missing-query');
 await page.getByText('No matching references.',{exact:false}).waitFor();
 await page.getByLabel('Search references').fill('');
 await page.getByRole('heading',{name:'Prelim help & wording'}).click();
 await page.screenshot({path:process.env.PRELIM_SCREENSHOT||'prelim-standards-preview.png',fullPage:true,animations:'disabled'});
 await page.getByRole('button',{name:'Edit draft',exact:true}).click();
 await page.getByRole('heading',{name:'Live formatting preview — draft'}).waitFor();
 console.log('PASS: empty approved explanation, question shortcut, draft discovery, autocomplete keyboard selection, search, emphasis, and edit preview.');
}finally{await browser.close();}

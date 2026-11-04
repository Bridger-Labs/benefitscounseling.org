/** Educational screening prompts, not SSA eligibility determinations. No personal data is stored. */
export type TriAnswer = 'yes' | 'no' | 'unsure';
export type ProgramChoice = 'ssi' | 'ssdi' | 'cdb' | 'ssi-ssdi' | 'ssi-cdb' | 'unsure';
export type ExpenseKind = 'medication' | 'transport' | 'equipment' | 'care' | 'serviceAnimal' | 'therapy' | 'technology' | 'other';
export type SupportKind = 'extraHelp' | 'jobCoach' | 'modifiedDuties' | 'paidBreaks' | 'specialArrangement' | 'other';
export type AnswerValue = string | string[];
export type ScreeningAnswers = Record<string, AnswerValue>;
export type Question = { id: string; prompt: string; hint?: string; type: 'single' | 'multi' | 'amount'; choices?: {value: string; label: string}[] };
export type ReviewStatus = 'possible' | 'review' | 'unlikely';

export const expenseChoices: {value: ExpenseKind; label: string; evidence: string; note?: string}[] = [
  {value:'medication',label:'Medicine, copays or medical supplies',evidence:'Receipts, prescriptions or medical-necessity records'},
  {value:'transport',label:'Special transportation to work',evidence:'Fare receipts or mileage logs; why ordinary transport is not sufficient',note:'Ordinary commuting, standing alone, usually is not deductible.'},
  {value:'equipment',label:'Medical device or equipment',evidence:'Purchase or rental receipts and medical support'},
  {value:'care',label:'Attendant or personal care for working',evidence:'Payment records, schedule and description of job-related assistance'},
  {value:'serviceAnimal',label:'Work-related service animal costs',evidence:'Receipts for care, supplies, training or veterinary services'},
  {value:'therapy',label:'Disability-related treatment or counseling',evidence:'Bills, payment receipts and treatment documentation'},
  {value:'technology',label:'Assistive software or specialized technology',evidence:'Purchase receipts and explanation of the work-related accessibility need'},
  {value:'other',label:'Another disability-related work expense',evidence:'Receipts and an explanation of the item, work need and impairment connection'},
];
export const supportChoices: {value: SupportKind; label: string; evidence: string}[] = [
  {value:'extraHelp',label:'Extra supervision or help compared with coworkers',evidence:'Supervisor description of extra time/support'},
  {value:'jobCoach',label:'Job coach or support worker assists with job tasks',evidence:'Job coach records, agency contact and duties performed'},
  {value:'modifiedDuties',label:'Fewer, easier or different job duties',evidence:'Job description and employer comparison with a similar role'},
  {value:'paidBreaks',label:'Extra paid breaks or reduced productivity expectations',evidence:'Schedule, timesheets and supervisor explanation'},
  {value:'specialArrangement',label:'Special arrangement with employer',evidence:'Employer statement describing the arrangement and value of work performed'},
  {value:'other',label:'Other accommodation or special work condition',evidence:'Description of assistance and effect on work performed'},
];
const yesNoUnsure = [ {value:'yes',label:'Yes'}, {value:'no',label:'No'}, {value:'unsure',label:'Not sure'} ];
const expenseQuestions: {key: string; label: string; hint?: string}[] = [
  {key:'connected',label:'Do you need this because of a physical or mental impairment?',hint:'You do not need to name or describe a diagnosis here.'},
  {key:'enablesWork',label:'Does the item or service enable you to work?',hint:'It may also be used outside work.'},
  {key:'paid',label:'Do you pay for this yourself?',hint:'If someone else pays all of it, select No.'},
  {key:'reimbursed',label:'Is this cost fully reimbursed (or paid back) by someone else?',hint:'If only part is reimbursed, select No and enter only your unreimbursed share on the next screen.'},
  {key:'reasonable',label:'Is the amount comparable to the usual local price?',hint:'SSA determines whether costs are reasonable; Not sure is fine.'},
];
const programLabels: Record<ProgramChoice,string> = {
  ssi:'SSI', ssdi:'SSDI', cdb:'CDB / DAC', 'ssi-ssdi':'SSI + SSDI', 'ssi-cdb':'SSI + CDB / DAC', unsure:'Not sure',
};
export function labelProgram(value: string): string {return programLabels[value as ProgramChoice] || value;}
export function hasSsi(program: string): boolean {return ['ssi','ssi-ssdi','ssi-cdb'].includes(program);}
export function hasTitleIi(program: string): boolean {return ['ssdi','cdb','ssi-ssdi','ssi-cdb'].includes(program);}
export function selections(answers: ScreeningAnswers, key: string): string[] {const value=answers[key]; return Array.isArray(value) ? value : [];}
export function displayAnswer(question: Question, answer: AnswerValue): string {
  if (Array.isArray(answer)) return answer.length ? answer.map(v=>question.choices?.find(x=>x.value===v)?.label || v).join(' · ') : 'None of these';
  if (question.type==='amount') return answer.trim() ? `$${Number(answer).toLocaleString('en-US', {maximumFractionDigits:2})} per month (estimate)` : 'Amount not known';
  return question.choices?.find(x=>x.value===answer)?.label || answer;
}

/** Questions are deterministic and conditional on previous selections. */
export function screeningQuestions(answers: ScreeningAnswers): Question[] {
  const questions: Question[]=[
    {id:'program',type:'single',prompt:'Which Social Security benefits do you receive?',hint:'CDB (Disabled Adult Child / DAC) is a Title II benefit. Select Not sure if you do not know.',choices:Object.entries(programLabels).map(([value,label])=>({value,label}))},
    {id:'work',type:'single',prompt:'Are you working now or planning to start?',choices:[{value:'working',label:'Working now'},{value:'planning',label:'Planning to work'},{value:'not',label:'Not currently working'}]},
    {id:'employment-type',type:'single',prompt:'What kind of work do you do (or expect to do)?',choices:[{value:'employee',label:'Employee (W-2)'},{value:'self',label:'Self-employed'},{value:'both',label:'Both'},{value:'unsure',label:'Not sure'}]},
    {id:'expenses',type:'multi',prompt:'Do you have any of these expenses because of an impairment or disability?',hint:'Select all that might apply, including items you need outside work. You can leave all unchecked.',choices:expenseChoices},
  ];
  for (const kind of selections(answers,'expenses')) {
    const label=expenseChoices.find(x=>x.value===kind)?.label ?? 'This expense';
    for (const part of expenseQuestions) questions.push({id:`irwe.${kind}.${part.key}`,type:'single',prompt:`${label}: ${part.label}`,hint:part.hint,choices:yesNoUnsure});
    questions.push({id:`irwe.${kind}.amount`,type:'amount',prompt:`About how much do you personally pay each month after any reimbursement for ${label.toLowerCase()}?`,hint:'Optional estimate only. Do not enter receipts, medical details or identifying information.'});
  }
  questions.push({id:'supports',type:'multi',prompt:'Do you receive any special help or conditions at work?',hint:'Select all that might apply. Support provided by a job coach or outside agency may count too.',choices:supportChoices});
  if(selections(answers,'supports').length){
    questions.push({id:'support-extra',type:'single',prompt:'Is this help or arrangement greater than what workers in a comparable position typically receive?',choices:yesNoUnsure});
    questions.push({id:'support-value',type:'single',prompt:'Could the support mean you are paid more than the reasonable value of the work you personally perform?',hint:'You do not have to know the dollar value; SSA determines that.',choices:yesNoUnsure});
    questions.push({id:'support-provider',type:'single',prompt:'Who provides this help?',choices:[{value:'employer',label:'My employer'},{value:'agency',label:'A job coach, agency or another provider'},{value:'both',label:'Both'},{value:'unsure',label:'Not sure'}]});
  }
  return questions;
}
export type ExpenseFinding = {kind: ExpenseKind; label: string; status: ReviewStatus; amount: number | null; reason: string; evidence: string};
export type SupportFinding = {status: ReviewStatus; labels: string[]; evidence: string[]; explanation: string} | null;
export type ScreeningSummary = {expenses: ExpenseFinding[]; support: SupportFinding; notes: string[]; possibleMonthlyTotal: number};
export function assessWorkSupports(answers: ScreeningAnswers): ScreeningSummary {
  const program=String(answers.program||'unsure');
  const expenses: ExpenseFinding[]=selections(answers,'expenses').map(raw=>{
    const kind=raw as ExpenseKind; const choice=expenseChoices.find(x=>x.value===kind);
    const prefix=`irwe.${kind}.`;
    const required=['connected','enablesWork','paid','reasonable'];
    const disqualifier=required.some(key=>answers[prefix+key]==='no') || answers[prefix+'reimbursed']==='yes';
    const possible=required.every(key=>answers[prefix+key]==='yes') && answers[prefix+'reimbursed']==='no';
    const status:ReviewStatus=disqualifier?'unlikely':possible?'possible':'review';
    const amountText=String(answers[prefix+'amount']??'');
    const value=amountText.trim()===''?null:Number(amountText);
    const amount=value!==null && Number.isFinite(value)&&value>=0?value:null;
    const reason=status==='possible'?'Meets the basic screening questions; SSA must verify and decide.':status==='unlikely'?'At least one basic IRWE condition does not appear to be met.':'Some answers still require evidence or clarification.';
    return {kind,label:choice?.label||kind,status,amount,reason,evidence:choice?.evidence||'Receipts and explanation of the need'};
  });
  const selectedSupport=selections(answers,'supports');
  let support:SupportFinding=null;
  if(selectedSupport.length){
    const extra=answers['support-extra']; const value=answers['support-value'];
    const status:ReviewStatus=extra==='no'&&value==='no'?'unlikely':extra==='yes'&&value==='yes'?'possible':'review';
    support={status,labels:selectedSupport.map(kind=>supportChoices.find(x=>x.value===kind)?.label||kind),evidence:selectedSupport.map(kind=>supportChoices.find(x=>x.value===kind)?.evidence||'Workplace records'),explanation:status==='possible'?'The answers suggest a possible subsidy or special condition for an SGA review; SSA determines its value.':status==='unlikely'?'No apparent difference in assistance or work value from coworkers was identified; review if conditions change.':'SSA may need more detail about the amount of assistance and value of the work.'};
  }
  const notes=[
    'IRWEs may be relevant to SSI income calculations and to Title II SGA decisions. Paying for an item alone does not guarantee a deduction.',
    'Subsidies or special conditions can affect SGA evaluations for SSDI/CDB, but are not deducted from wages when calculating ongoing SSI cash payments.',
    'No IRWE or subsidy is automatically deducted during TWP service-month counting. The TWP uses separate rules.',
    'Do not subtract a suspected subsidy from a gross wage report; report actual gross pay and ask SSA to evaluate the support.',
  ];
  if(answers['employment-type']==='self'||answers['employment-type']==='both') notes.unshift('Self-employment uses additional SSA rules, including unincurred business expenses and work-activity tests. A wage-based subsidy screen may not apply directly; ask a counselor for an individualized review.');
  if(program==='unsure') notes.unshift('Confirm whether you receive SSI, SSDI, CDB/DAC, or both; the applicable rules differ.');
  if(answers.work==='planning'||answers.work==='not') notes.unshift('These are planning possibilities; the relevant expense and work months must be reviewed when work begins.');
  if(hasSsi(program)) notes.push('For SSI, an IRWE generally reduces countable earned income under the applicable income exclusion rules—not dollar-for-dollar payment increases.');
  if(hasTitleIi(program)) notes.push('For SSDI/CDB, SSA may consider verified IRWEs and subsidies when assessing SGA after the Trial Work Period.');
  notes.push('If SSA considers you statutorily blind and you receive SSI, ask about Blind Work Expenses (BWE), which use different rules.');
  const possibleMonthlyTotal=expenses.filter(item=>item.status==='possible').reduce((sum,item)=>sum+(item.amount??0),0);
  return {expenses,support,notes,possibleMonthlyTotal};
}

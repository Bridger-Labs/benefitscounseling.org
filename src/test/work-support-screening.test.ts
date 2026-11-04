import { describe, expect, it } from 'vitest';
import {assessWorkSupports,screeningQuestions, type ScreeningAnswers} from '../lib/workSupportScreening';

describe('IRWE and subsidy guided screening', () => {
  const possibleIrwe:ScreeningAnswers={program:'ssi',work:'working',expenses:['transport'],
    'irwe.transport.connected':'yes','irwe.transport.enablesWork':'yes',
    'irwe.transport.paid':'yes','irwe.transport.reimbursed':'no',
    'irwe.transport.reasonable':'yes','irwe.transport.amount':'125', supports:[]};
  it('branches to expense detail questions and skips subsidy questions when none is selected',()=>{
    const qs=screeningQuestions(possibleIrwe);
    expect(qs.some(q=>q.id==='irwe.transport.connected')).toBe(true);
    expect(qs.some(q=>q.id==='irwe.medication.connected')).toBe(false);
    expect(qs.some(q=>q.id==='support-provider')).toBe(false);
  });
  it('only flags fully-answered qualifying expense as possible, never approved',()=>{
    const result=assessWorkSupports(possibleIrwe);
    expect(result.expenses[0].status).toBe('possible');
    expect(result.expenses[0].amount).toBe(125);
    expect(result.notes.some(note=>note.includes('SSI'))).toBe(true);
  });
  it('rejects a fully reimbursed expense',()=>{
    expect(assessWorkSupports({...possibleIrwe,'irwe.transport.reimbursed':'yes'}).expenses[0].status).toBe('unlikely');
  });
  it('keeps unknown answers in review, rather than treating them as qualifying',()=>{
    expect(assessWorkSupports({...possibleIrwe,'irwe.transport.connected':'unsure'}).expenses[0].status).toBe('review');
  });
  it('does not confuse workplace assistance with a self-paid IRWE',()=>{
    const result=assessWorkSupports({program:'cdb',work:'working',expenses:[],supports:['jobCoach'], 'support-extra':'yes','support-value':'yes','support-provider':'agency'});
    expect(result.expenses).toHaveLength(0);
    expect(result.support?.status).toBe('possible');
    expect(result.notes.some(note=>note.includes('TWP'))).toBe(true);
  });
  it('does not claim an automatic subsidy when work value is uncertain',()=>{
    const result=assessWorkSupports({program:'ssdi',work:'working',expenses:[],supports:['extraHelp'],'support-extra':'yes','support-value':'unsure','support-provider':'employer'});
    expect(result.support?.status).toBe('review');
  });
  it('does not provide an automatic subsidy when only SSI payments are involved',()=>{
    const result=assessWorkSupports({program:'ssi',work:'working',expenses:[],supports:['jobCoach'],'support-extra':'yes','support-value':'yes','support-provider':'employer'});
    expect(result.notes.some(note=>note.includes('not deducted from wages when calculating ongoing SSI'))).toBe(true);
  });
});

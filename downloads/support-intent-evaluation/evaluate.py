"""Reproducible support-intent selection experiment. Run: python evaluate.py
Dependencies are pinned in requirements.txt. No API keys or external model.
"""
from pathlib import Path
import csv,json,hashlib,urllib.request,sys,platform
import numpy as np
import scipy,sklearn
from scipy.stats import beta
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression
from threadpoolctl import threadpool_limits
ROOT=Path(__file__).resolve().parent
SHA='57ec275d8078af65b7731c2a98be812d844a6d6b'
PROTOCOL={
 'dataset':'BANKING77', 'source_commit':SHA, 'seed':20261021,
 'model':'word TF-IDF unigrams/bigrams + multinomial logistic regression',
 'tfidf':{'ngram_range':[1,2],'sublinear_tf':True,'min_df':2},
 'logistic_regression':{'C':10.0,'max_iter':1000,'solver':'lbfgs','tol':0.0001},
 'training_fraction':0.7,'split':'Fixed random permutation of unique normalized official training texts; first 70% for training, rest calibration. Official test kept for final evaluation. Exact text duplicates removed.',
 'score':'maximum predicted class probability; used only as ranking score',
 'thresholds':[0.35,0.45,0.55,0.65,0.70,0.75,0.80,0.85,0.90,0.95],
 'targets':[0.01,0.02,0.05,0.10], 'family_delta':0.05,
 'bound':'One-sided Clopper-Pearson binomial upper bound, Bonferroni delta/10 for simultaneous threshold validity.',
 'selection':'At each target, choose threshold with most calibration selections among those with upper bound <= target; ties prefer higher threshold. No passing threshold means all requests retain review.',
 'error':'Predicted intent differs from the dataset intent label.',
 'population':'English banking support queries under the same sampling distribution; 77 known intents.',
 'scope':'Intent routing, not factual correctness of generated replies. Assumes independent examples and fixed model and threshold family. No guarantee under distribution shift, missing labels or correlated conversations.',
 'workload':'One routing review per unselected enquiry. No audits, reviewer errors, task durations, integration or setup costs modelled.',
 'tuning':'One model configuration, one split and one predeclared threshold family. No tuning on calibration/test results.'}
# Persist protocol before loading data or evaluating predictions.
(ROOT/'protocol.json').write_text(json.dumps(PROTOCOL,indent=2)+'\n')
def fetch(name):
 p=ROOT/name
 if not p.exists():
  url=f'https://raw.githubusercontent.com/PolyAI-LDN/task-specific-datasets/{SHA}/'+('LICENSE' if name=='LICENSE' else 'banking_data/'+name)
  p.write_bytes(urllib.request.urlopen(url).read())
 return p
license_file=fetch('LICENSE');print('License:',license_file.read_text()[:120],flush=True)
def read(name):
 p=fetch(name)
 return list(csv.DictReader(p.open())),hashlib.sha256(p.read_bytes()).hexdigest()
def norm(t):return ' '.join(t.casefold().split())
rows,trainhash=read('train.csv')
seen=set(); unique=[]
for i,r in enumerate(rows):
 key=norm(r['text'])
 if key not in seen: unique.append((i,r));seen.add(key)
rng=np.random.default_rng(PROTOCOL['seed']); perm=rng.permutation(len(unique));cut=int(len(unique)*.7)
train=[unique[i] for i in perm[:cut]];cal=[unique[i] for i in perm[cut:]]
model=make_pipeline(TfidfVectorizer(ngram_range=(1,2),sublinear_tf=True,min_df=2),LogisticRegression(**PROTOCOL['logistic_regression']))
print('Fitting',len(train),'training enquiries;',len(cal),'calibration enquiries',flush=True)
with threadpool_limits(limits=1):model.fit([r['text'] for _,r in train],[r['category'] for _,r in train])
classes=model[-1].classes_
def predict(rs):
 p=model.predict_proba([r['text'] for _,r in rs]); idx=p.argmax(axis=1)
 return p.max(axis=1),classes[idx],np.array([classes[j]!=r['category'] for j,(_,r) in zip(idx,rs)])
def upper(k,n): return 1.0 if n==0 or k==n else float(beta.ppf(1-.05/10,k+1,n-k))
cs,cp,ce=predict(cal); candidates=[]
for t in PROTOCOL['thresholds']:
 mask=cs>=t;n=int(mask.sum());k=int(ce[mask].sum())
 candidates.append({'threshold':t,'selected':n,'errors':k,'upper_bound':upper(k,n)})
policies=[]
for target in PROTOCOL['targets']:
 passing=[x for x in candidates if x['upper_bound']<=target]
 chosen=max(passing,key=lambda x:(x['selected'],x['threshold'])) if passing else None
 policies.append({'target':target,'calibration':chosen})
(ROOT/'selected-policies-before-test.json').write_text(json.dumps(policies,indent=2))
# Test labels are loaded only after the choices above are frozen.
testrows,testhash=read('test.csv');test=[];test_seen=set();overlap=0;testdup=0
for i,r in enumerate(testrows):
 key=norm(r['text'])
 if key in seen:overlap+=1;continue
 if key in test_seen:testdup+=1;continue
 test_seen.add(key);test.append((i,r))
ts,tp,te=predict(test)
for p in policies:
 mask=ts>=p['calibration']['threshold'] if p['calibration'] else np.zeros(len(ts),dtype=bool)
 n=int(mask.sum());k=int(te[mask].sum())
 p['test']={'selected':n,'errors':k,'retained_review':len(test)-n,'selected_fraction':n/len(test),'observed_error_rate':k/n if n else None}
report={'protocol':PROTOCOL,'versions':{'python':platform.python_version(),'numpy':np.__version__,'scipy':scipy.__version__,'scikit_learn':sklearn.__version__},'sha256':{'train.csv':trainhash,'test.csv':testhash},'counts':{'official_train':len(rows),'training':len(train),'calibration':len(cal),'official_test':len(testrows),'test':len(test),'train_duplicates_removed':len(rows)-len(unique),'test_overlap_removed':overlap,'test_duplicates_removed':testdup},'test_without_selection':{'errors':int(te.sum()),'n':len(test),'error_rate':float(te.mean())},'candidates':candidates,'policies':policies,'iterations':model[-1].n_iter_.tolist()}
(ROOT/'results.json').write_text(json.dumps(report,indent=2)+'\n')
with (ROOT/'scored-queries.csv').open('w') as f:
 w=csv.writer(f);w.writerow(['split','official_row','text_sha256','reference_intent','predicted_intent','score','error'])
 for split,rs,score,pred,err in [('calibration',cal,cs,cp,ce),('test',test,ts,tp,te)]:
  for (i,r),v,label,e in zip(rs,score,pred,err):w.writerow([split,i,hashlib.sha256(r['text'].encode()).hexdigest(),r['category'],label,format(v,'.17g'),int(e)])
print(json.dumps({'counts':report['counts'],'baseline':report['test_without_selection'],'policies':policies},indent=2),flush=True)

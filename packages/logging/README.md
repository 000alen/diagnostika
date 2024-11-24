# g

the patient provides a their clinical history, 
which is represented as an array of snapshots,

each snapshot has a timestamps, descriptions of symptoms
and relevant medical exams (images, and extractable text)

## Algo

### Phase 1

for each snapshot, 

we extract symptoms (nodes "weighted" by inverse time decay) from the descriptions of symptoms,

for each medical exam, we infer the symptom based on the result

we create edges between known related symptoms (matching against the db)

### Phase 2

we create edges from graph i to graph i+1 if symptoms are known to be related in evolution

### Phase 3

the resulting graph regarding diseases (sorted by semantic similarity)

## Implementation


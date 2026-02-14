## EVIDENCE
### (protected)

1. **ATTRIBUTES**
   - evidence_id : int
   - evidence_type : String
   - upload_timestamp : float
   - hash_value : String
2. **METHODS**
   - calculate_hash     (String)
   - validate_integrity (void)


## A. FACE RECOGNITION (extends EVIDENCE)
**METHODS**
  - Is_FR_valid        (boolean)
  - Search_FR_datsets  (void)

## B. FINGERPRINT RECOGNITION (extends EVIDENCE)
**METHODS**
  - Is_FP_valid        (boolean)
  - Search_FP_datsets  (void)

## C. BLOOD ANALYSIS (extends EVIDENCE)
**METHODS**
  - Is_BA_valid        (boolean)
  - Search_BA_datsets  (void)

# Interaction Between System Components

---

## Authentication Layer

-	Used by all three roles
-	Validates credentials
-	Retrieves identity data from : **User Metadata Database**

## Evidence Processing Pipeline

  Sequential flow: Ensures structured analysis
    **Upload Evidence**
          ↓
    **Select Evidence Type**
          ↓
    **Preprocess Evidence**
          ↓
    **Perform Forensic Analysis**
          ↓
    **Generate Forensic Reports**

## Data Repositories

1. **User Metadata Database**:
-	Stores user credentials & roles
2. **Training Datasets**:
-	Provides ML / reference data
3. **Report & Analysis Database**:
-	Stores forensic outputs
4. **Logs Database**:
-	Maintains integrity & custody trail

---

# System Interaction Diagram
 <img width="500" height="auto" margin="auto" alt="image" src="https://github.com/user-attachments/assets/d30772c4-57f1-4997-b3e7-8308095c9e58" />



# End to End Example of Complete System Flow
1. Investigator uploads evidence
2. System ↔Select Evidence Type
3. System ↔Preprocess Evidence
4. Analyst ↔Perform Forensic Analysis
5. System ↔Generate Forensic Reports
6. Reports stored ↔Report & Analysis DB
7. Administrator ↔Monitors Logs & Custody


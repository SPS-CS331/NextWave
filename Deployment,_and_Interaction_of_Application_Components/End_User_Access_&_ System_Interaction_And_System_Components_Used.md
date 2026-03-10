# II. End User Access & System Interaction

## System Users

The system is accessed by three primary user roles:

- **System Administrator**
- **Forensic Investigator**
- **Forensic Analyst**

Each role interacts with specific components of the system based on their responsibilities.

---

# Role-Based System Interaction

---

## 1️⃣ System Administrator Interaction

### Primary Responsibilities
- User authentication
- Role management
- Dataset management
- Chain of custody monitoring

### System Components Used

#### Authentication
- Administrator logs in using credentials
- System validates identity via **User Metadata Database**

#### Manage Datasets & User Roles
- Assigns user roles
- Configures training/reference datasets
- Interacts with **Training Datasets Repository**

#### View Chain of Custody
- Monitors integrity logs
- Interacts with **Logs Database**

### Interaction Flow

1. Administrator → Authentication Module  
2. Authentication Module → User Metadata Database  
3. Administrator → Manage Datasets & Roles  
4. System → Training Datasets Repository  
5. Administrator → View Chain of Custody  
6. System → Logs Database  

---

## 2️⃣ Forensic Investigator Interaction

### Primary Responsibilities
- Evidence submission
- Evidence classification

### System Components Used

#### Authentication
- Investigator identity verification

#### Upload Evidence
- Submits digital evidence files
- Sends data to **Preprocessing Module**

#### Select Evidence Type
- Classifies evidence  
  - Image  
  - Fingerprint  
  - Other digital evidence

### Interaction Flow

1. Investigator → Authentication  
2. Investigator → Upload Evidence  
3. Evidence → Select Evidence Type  
4. Evidence → Preprocess Evidence  

---

## 3️⃣ Forensic Analyst Interaction

### Primary Responsibilities
- Data preprocessing
- Forensic analysis
- Report generation
- Report review

### System Components Used

#### Preprocess Evidence
- Cleans and structures evidence data
- Uses reference datasets

#### Perform Forensic Analysis
- Applies analytical models
- Uses **Training / Reference Datasets**

#### Generate Forensic Reports
- Stores results in **Report & Analysis Database**

#### Review Reports
- Examines stored forensic outputs

### Interaction Flow

1. Analyst → Preprocess Evidence  
2. Evidence → Perform Forensic Analysis  
3. Results → Generate Forensic Reports  
4. Reports → Report & Analysis Database  
5. Analyst → Review Reports  

---

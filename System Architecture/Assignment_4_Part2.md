# Forensic System Architecture

---

# 1️. Presentation Layer (UI Layer)

## . Components

### 1. Authentication & Profile Interface
- Login input  
- JWT token handling  
- View / update profile information  

### 2. Dashboard & Navigation Module
- Role-based dashboard (Admin / Investigator / Analyst)  
- Navigation control  
- Access-based UI rendering  

### 3. Evidence Management Interface
- File upload interface  
- Evidence viewing panel  

### 4. Reporting & Visualization Module
- Display forensic analysis results  
- Graphical / tabular visualization  
- View and download reports (PDF)  

---

# 2️. Application / Business Logic Layer

## . Components

### 1. Authentication & Access Control Module
- Login validation  
- Password hashing  
- JWT generation & verification  
- Role verification  
- Route protection  

### 2. Evidence Processing Module
- Handle uploads  
- Validate file types  
- Store metadata  
- Case association  

### 3. Forensic Analysis & ML Integration Module
- Analytical operations  
- Feature extraction  
- Apply forensic techniques  
- Execute ML models  

### 4. Report & Documentation Module
- Compile findings  
- Format reports  
- Store reports in database  

### 5. Chain of Custody & Logging Module
- Track evidence ownership  
- Maintain evidence timeline  
- Log user actions  

---

#  3️. Machine Learning / Analysis Layer

## . Components

### 1. Model Management Module
- Model loading  
- Version control  

### 2. Inference & Prediction Module
- Feature extraction  
- Execute trained models  
- Generate predictions  
- Return confidence scores  

---

# 4️. Data Layer (Persistence Layer)

## . Components

### 1. User & Access Database
- User credentials  
- Roles  
- Profile data  

### 2. Evidence & Case Repository
- Evidence files  
- Metadata  
- Case linkage  

### 3. Reports & Logs Repository
- Generated reports  
- Audit logs  
- Activity tracking  

### 4. Model Storage Repository
- Trained ML models  
- Model version history  


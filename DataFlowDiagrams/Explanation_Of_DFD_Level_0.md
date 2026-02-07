# Data Flow Diagram (DFD) – Level 0

The Level 0 Data Flow Diagram (DFD) represents the entire "Automated Digital Forensic Evidence Collection and Analysis System" as a **single process**. It illustrates how the system interacts with external entities and shows the high-level flow of data between them, without exposing internal processes or data stores.

---

## Central Process:  Automated Digital Forensic Evidence Collection and Analysis System
This process represents the complete forensic system responsible for:
- Collecting digital evidence
- Managing users and datasets
- Performing forensic analysis
- Generating and sharing forensic reports to the investigator

---

## External Entities and Their Roles

### 1. System Administrator  
**Role:** Manages users, datasets, and system logs.

**Data Flow:**
- **Assigns Roles to Users and Provides Datasets → System**  
  The system administrator supplies user role assignments and forensic/training datasets required for system operation and analysis.

---

### 2. Forensic Investigator
**Role:** Collects and uploads digital evidence related to cases.

**Data Flow:**
- **Uploads Evidence and Case Details → System**  
  The investigator submits digital evidence (such as disk images, logs, or network captures) along with case-related information.
  
- **Review Reports ← System**  
  The investigator receives generated forensic reports for review and further investigation.

---

### 3. Forensic Analyst  
**Role:** Analyzes evidence and prepares forensic reports.

**Data Flow:**
- **Performs Analysis ← System**  
  The system provides processed evidence and analysis capabilities to the forensic analyst.
  
- **Generates Reports → System**  
  The analyst submits analyzed findings and report details back to the system for storage and further review.

---

## Key Characteristics of Level 0 DFD
- Represents the system as a **single high-level process**
- Shows **only external entities and data flows**
- Does **not include internal processes or data stores**

---

## Conclusion
The DFD Level 0 provides a clear and concise overview of how the Automated Digital Forensic Evidence Collection and Analysis System interacts with its primary users. It establishes the foundation for more detailed DFD levels by identifying major data exchanges and stakeholder responsibilities.

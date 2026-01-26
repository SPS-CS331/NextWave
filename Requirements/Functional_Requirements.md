# 2. Functional Features of the System

  ### 2.1 Login and Role Management  
    The system shall allow users to log in securely and access features based on their assigned roles such as Investigator, Analyst, and Administrator.  
    
    Tools and Technologies:  
    - Frontend: React.js  
    - Backend: Node.js with Express / Django REST  
    - Security: JWT for login  
    - Access Control: Role-Based Access Control (RBAC)  

  ### 2.2 Evidence Upload and Dataset Support  
    The system shall enable users to upload different types of digital evidence and use standard forensic datasets for analysis.  
    
    Tools and Technologies:  
    - Upload Interface: React.js  
    - Server APIs: REST services  
    - Dataset Processing: Python, Pandas, NumPy  
    - File Checking: Backend validation  

  ### 2.3 Automatic Data Processing  
    The system shall process uploaded evidence automatically and extract useful information from it.  
    
    Tools and Technologies:  
    - Image Processing: OpenCV, PIL  
    - Biometric Analysis: NumPy, SciPy  
    - Log Processing: Pandas  
    - Database: PostgreSQL / MongoDB  

  ### 2.4 Machine Learning Analysis  
    The system shall analyze the evidence using machine learning models to identify patterns and classify data.  
    
    Tools and Technologies:  
    - ML Libraries: Scikit-learn, TensorFlow, Keras  
    - Programming: Python  
    - Data Handling: NumPy, Pandas  

  ### 2.5 Evidence Security and Integrity  
    The system shall protect evidence by generating hash values to ensure it has not been altered.  
    
    Tools and Technologies:  
    - Hashing: Python hashlib / Node.js crypto  
    - Secure Storage: Encrypted databases  

  ### 2.6 Activity Logs and Chain of Custody  
    The system shall keep records of all actions performed on evidence to maintain a proper chain of custody.  
    
    Tools and Technologies:  
    - Logging: Backend audit logs  
    - Database: PostgreSQL / MongoDB  
    - Report Tools: Python  

  ### 2.7 Result Visualization  
    The system shall show analysis results in the form of charts and dashboards.  
    
    Tools and Technologies:  
    - Frontend: React.js  
    - Charts: Chart.js / Recharts  
    - APIs: REST services  

  ### 2.8 Report Creation  
    The system shall generate detailed reports of forensic analysis for investigation and legal use.  
    
    Tools and Technologies:  
    - Report Generation: Python (ReportLab / FPDF)  
    - Export: PDF, CSV  
    - Storage: PostgreSQL / MongoDB  

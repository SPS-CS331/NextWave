
# UML Use Case Diagram  
## Automated Digital Forensics Evidence Collection and Analysis System

This Use Case Diagram illustrates the functionality and user interactions of an **Automated Digital Forensics Evidence Collection and Analysis System**. The system is designed to securely collect, analyze, and manage digital evidence while maintaining its integrity and chain of custody.

---

## Actors

### System Administrator
- Manages system users and roles  
- Maintains datasets and forensic models  
- Monitors system logs  
- Ensures secure system access through authentication  

### Forensic Investigator
- Logs into the system  
- Uploads digital evidence  
- Selects evidence type  
- Reviews forensic reports  
- Views chain of custody information  

### Forensic Analyst
- Preprocesses digital evidence  
- Performs forensic analysis  
- Generates forensic investigation reports  

### Registered User / New User / Web User
- Accesses the system through a web interface  
- New users can register  
- Registered users can log in and use system features based on permissions  

---

## External Services

### Authentication Service
- Handles secure login and user authentication  

### Evidence Management Service
- Stores and manages digital evidence securely  

### Report Visualization Service
- Converts forensic analysis results into visual and readable reports  

---

## Use Case Relationships

- **Preprocess Evidence** is included in **Perform Forensic Analysis**, indicating that preprocessing is a mandatory step before analysis.  
- **Generate Forensic Reports** extends **Perform Forensic Analysis**, meaning reports are generated after successful analysis.  

---

## System Overview

The system supports the complete digital forensic workflow, starting from evidence collection to analysis and reporting. Administrators manage system resources, investigators handle evidence collection and verification, and analysts perform detailed forensic analysis. Integrated services ensure security, reliability, and proper documentation throughout the investigation process.

---

## Conclusion

This use case diagram provides a high-level view of how different users interact with the system and how core forensic functionalities are organized to ensure secure and efficient digital forensic investigations.

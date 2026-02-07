###Data Flow Diagram (Level-1) Explanation
##Automated Digital Forensics Evidence Collection and Analysis System
 - Overview

The Level-1 Data Flow Diagram represents the internal working of the Automated Digital Forensics Evidence Collection and Analysis System.
It decomposes the system into multiple functional processes and shows how data flows between users and these processes to ensure secure evidence handling, accurate analysis, and legal integrity.

The system interacts with three main external entities:

System Administrator

Forensic Investigator

Forensic Analyst

##Explanation of Data Flow and Processes
 - 1. Authentication

All users (System Administrator, Forensic Investigator, and Forensic Analyst) must first authenticate themselves.

Data Flow:

Users provide login credentials

The system verifies user identity and access permissions

Purpose:

Ensures that only authorized users can access forensic data and system features.

 - 2. Upload Evidence

The Forensic Investigator uploads digital evidence into the system.

Data Flow:

Digital evidence files

Case-related details (case ID, description, time of collection)

Purpose:

Introduces raw digital evidence into the forensic system for further processing.

 - 3. Select Evidence Type

After uploading evidence, the investigator specifies the type of evidence.

Data Flow:

Evidence type information (image, video, log file, document, etc.)

Purpose:

Helps the system determine appropriate preprocessing and analysis techniques.

 - 4. Manage Datasets and User Roles

This process is handled by the System Administrator.

Data Flow:

User role configuration data

Dataset and model management details

Purpose:

Controls access rights of users

Maintains datasets and models required for forensic analysis.

 - 5. Preprocess Evidence

The uploaded evidence undergoes preprocessing before analysis.

Data Flow:

Raw digital evidence

Reference datasets or model inputs

Purpose:

Cleans, formats, and prepares evidence for accurate forensic analysis.

 - 6. Perform Forensic Analysis

The Forensic Analyst performs detailed analysis on preprocessed evidence.

Data Flow:

Processed evidence data

Analysis parameters and requests

Purpose:

Identifies patterns, anomalies, or manipulations in evidence using forensic and analytical techniques.

 - 7. Generate Forensic Reports

Results of forensic analysis are converted into structured reports.

Data Flow:

Analysis results

Structured forensic findings

Purpose:

Produces legally admissible forensic reports for investigations and court proceedings.

 - 8. Review Reports

Authorized users review the generated forensic reports.

Data Flow:

Forensic reports to be examined by investigators and analysts

Purpose:

Allows verification and validation of results before final submission.

 - 9. View Chain of Custody

The system provides a complete record of evidence handling activities.

Data Flow:

Evidence handling history

Integrity verification data

Purpose:

Maintains transparency, accountability, and forensic soundness of evidence throughout its lifecycle.
    

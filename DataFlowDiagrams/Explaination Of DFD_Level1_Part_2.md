
# Data Flow Diagram – Automated Digital Forensics System

## Overview
This system automates digital forensic evidence collection, preprocessing, analysis, reporting, and integrity verification using role-based access and machine learning assistance.

---

## External Entities
- **System Administrator**
- **Forensic Investigator**
- **Forensic Analyst**

---

## Data Stores
- User Metadata
- Training Datasets
- Report & Analysis Database
- Logs Database (Chain of Custody)

---

## Level-1 Data Flow Diagram

```mermaid```
flowchart TD

Admin[System Administrator]
Investigator[Forensic Investigator]
Analyst[Forensic Analyst]

Auth[Authentication]
Upload[Upload Evidence]
SelectType[Select Evidence Type]
Manage[Manage Datasets & User Roles]
Preprocess[Preprocess Evidence]
Analyze[Perform Forensic Analysis]
Report[Generate Forensic Reports]
Review[Review Reports]
Custody[View Chain of Custody]

UserDB[(User Metadata)]
TrainDB[(Training Datasets)]
ReportDB[(Report & Analysis Database)]
LogDB[(Logs Database)]

Admin -->|Login credentials| Auth
Auth -->|User identity & access metadata| UserDB

Investigator -->|Evidence files & case details| Upload
Upload --> SelectType

Admin -->|Role & dataset config| Manage
Manage --> TrainDB

SelectType --> Preprocess
TrainDB -->|Reference datasets| Preprocess

Preprocess --> Analyze
Analyze --> Report

Report -->|Final forensic reports| ReportDB
Analyst --> Review
Review -->|Retrieve reports| ReportDB

Admin --> Custody
Custody -->|Integrity verification| LogDB

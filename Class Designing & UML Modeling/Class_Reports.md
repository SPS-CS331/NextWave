# Reports Module

This module defines the base **REPORTS** class and its specialized subclasses used for generating and managing different types of reports.

---

## Class: REPORTS (Protected)

### Attributes
- `report_id`  
- `evidence_id`

### Methods
- `request_report()`

---

## Class: ANALYSIS_REPORT (extends REPORTS)

### Attributes
- `findings`  
- `confidence_score`

### Methods
- `display_analysis_report()`

---

## Class: LOGS_REPORT (extends REPORTS)

### Attributes
- `log_id`  
- `log_list`

### Methods
- `is_modified()`  
- `view_logs()`

---

REPORTS  
├── ANALYSIS_REPORT  
└── LOGS_REPORT




---

## Notes
- `REPORTS` acts as a base class containing common report metadata.
- `ANALYSIS_REPORT` is used for analytical findings with confidence evaluation.
- `LOGS_REPORT` focuses on system or activity logs and modification detection.

## Inheritance Overview


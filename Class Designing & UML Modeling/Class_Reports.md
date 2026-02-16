# Reports Module

This module defines the base **REPORTS** class and its specialized subclasses used for generating and managing different types of reports.

---

## Class: REPORTS (Protected)

### Attributes
- `report_id : int`  
- `evidence_id : int`

### Methods
- `request_report() : void`

---

## Class: ANALYSIS_REPORT (extends REPORTS)

### Attributes
- `findings : String`  
- `confidence_score : float`

### Methods
- `display_analysis_report() : void`

---

## Class: LOGS_REPORT (extends REPORTS)

### Attributes
- `log_id : int`  
- `log_list : List<String>`

### Methods
- `is_modified() : boolean`  
- `view_logs() : void`

---

## Inheritance Structure



REPORTS  
├── ANALYSIS_REPORT  
└── LOGS_REPORT



---

## Notes
- `REPORTS` acts as a base class containing common report metadata.
- `ANALYSIS_REPORT` is used for analytical findings with confidence evaluation.
- `LOGS_REPORT` focuses on system or activity logs and modification detection.
- All method return types are explicitly defined for implementation clarity.

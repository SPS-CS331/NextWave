# Class Design – Digital Forensics System

## USER *(Public Class)*

### Attributes
- `user_id : String`
- `name : String`
- `email : String`
- `role : String`
- `password_hash : String`

### Methods
- `login() : boolean`
- `view_profile() : void`
- `logout() : void`

---

## SYSTEM_ADMINISTRATOR *(extends USER)*

### Attributes
- `admin_id : String`

### Methods
- `assign_role(user_id : String, role : String) : void`
- `manage_datasets() : void`
- `view_system_logs() : void`

---

## FORENSIC_INVESTIGATOR *(extends USER)*

### Attributes
- `investigator_id : String`
- `department : String`

### Methods
- `upload_evidence() : void`
- `select_evidence_type(type : String) : void`
- `review_reports() : void`

---

## FORENSIC_ANALYST *(extends USER)*

### Attributes
- `analyst_id : String`
- `specialization : String`

### Methods
- `analyse_evidence() : void`
- `generate_report() : void`

---

## Inheritance Hierarchy

```text
USER
├── SYSTEM_ADMINISTRATOR
├── FORENSIC_INVESTIGATOR
└── FORENSIC_ANALYST

---

## Visibility Legend
- `+` → Public  
- `-` → Private  
- `#` → Protecte


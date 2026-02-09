Class Design – Digital Forensics System
1. USER (Public Class)
Attributes

+ user_id : String

+ name : String

+ email : String

+ role : String

- password_hash : String

Methods

+ login() : boolean

+ view_profile() : void

+ logout() : void

2. SYSTEM_ADMINISTRATOR (extends USER)
Attributes

+ admin_id : String

Methods

+ assign_role(user_id : String, role : String) : void

+ manage_datasets() : void

+ view_system_logs() : void

3. FORENSIC_INVESTIGATOR (extends USER)
Attributes

+ investigator_id : String

+ department : String

Methods

+ upload_evidence() : void

+ select_evidence_type(type : String) : void

+ review_reports() : void

4. FORENSIC_ANALYST (extends USER)
Attributes

+ analyst_id : String

+ specialization : String

Methods

+ analyse_evidence() : void

+ generate_report() : void

Inheritance Relationship Summary
USER
 ├── SYSTEM_ADMINISTRATOR
 ├── FORENSIC_INVESTIGATOR
 └── FORENSIC_ANALYST

Visibility Legend

+ → Public

- → Private

# → Protected

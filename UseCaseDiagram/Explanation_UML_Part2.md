## Explanation of Use Case Diagram [Part 2]

In addition what my teammate (Poorvi Agarwal) has done in Part 1 of the UML diagram, the diagram for Part 2 represents the **Use Case Diagram** of the **Automated Digital Forensics Evidence Collection and Analysis System**, illustrating the **interaction between different categories of users and the system functionalities (use cases)** within a defined system boundary.

---

### Users Identified

 - **Forensic Analyst**
   The Forensic Analyst performs technical analysis on the collected evidence, after a specific evidence type is selected and the evidence is uploaded. This includes preprocessing, forensic analysis, and report generation. Hence the Analyst is taking uploads from the investigator, analysing it, and handing over the reports to be viewed by the investigator.

 - **Registered User**
   A Registered User represents a user who has already been authenticated and granted access to the system. The System Administration is someone who is already registered.

 - **New User**
   A New User represents a user who is newly added to the system and may be assigned roles such as investigator or analyst after secure registration / authentication.

 - **System Administrator**
   The System Administrator is responsible for managing and monitoring the system. This actor interacts with administrative and maintenance-related functionalities.

 - **Forensic Investigator**
   The Forensic Investigator is responsible for collecting digital evidence, selecting evidence types, reviewing reports, and ensuring proper chain of custody during investigations.

---

### **Use Cases** included inside the system boundary, for a **Forensic Analyst**:

 - **Login**
  Allows all authorized users, including the analysts, to access the system based on their credentials.

 - **Preprocess Evidence**
  Represents preparation of evidence data for forensic analysis, performed by the Forensic Analyst, after the investigator has uploaded the evidence.

 - **Perform Forensic Analysis**
  Represents the application of forensic analysis techniques like machine learning and computer vision models, etc. to analyze the evidence.

 - **Generate Forensic Reports**
  Allows the Forensic Analyst to generate structured forensic reports based on analysis results, which is to be viewed by the investigator.

---

### **Association Relationships**
The Association relationships are represented using straight lines connecting actors to their respective use cases, indicating direct interaction with the system. For example, multiple users are connected to the Login use case, indicating that authentication is required for all system users. The Forensic Analyst is therefore associated with analysis-related use-cases like the four uses stated above.

---

### Relation between New User & other users

 - The arrow connections from other user roles (Forensic Analyst and Forensic Investigator) to New User represents user role assignment and transition.

 - A New User initially enters the system without predefined privileges, and is yet to sign up to get his/her log-in credentials.

 - After verification / authorization by the System Administrator, the New User can be assigned a specific role (either of the two, in this case) and thereby transition into a functional user such as a Forensic Investigator or Forensic Analyst.

 - New User represents a preliminary state before registration and role assignment.

 - However, the role of System Administrator is not connected to New User, since an administrator is usually, already registered for any system.

---

### Relation between Registered User & other users

 - The arrow connections from other user roles (System Administrator, Forensic Analyst, and Forensic Investigator) to Registered User represents a generalization relationship, indicating that all three kinds of operational users of the system are specialized types of Registered Users.

 - This means that every System Administrator, Forensic Investigator, and Forensic Analyst must first be a Registered User, before using the system, which makes the system more secure.

 - Common functionalities such as login and basic system access apply to all Registered Users.

 - Specialized permissions and responsibilities are inherited based on the assigned role, hence authorization is required.

 - Specialized users inherit authentication and access behavior from Registered User.

---

#### System Boundary

The rectangular boundary represents the scope of the Automated Digital Forensics Evidence Collection and Analysis System. All use cases inside this boundary are functionalities provided by the system, while all actors outside the boundary represent external entities interacting with it. So users like the forensic analyst are kept outside the system boundary, as they are external to the system.

---

#### Current Status of the UCD

This diagram represents a partial implementation of the system’s use case model. It successfully identifies:
 - Major actors
 - Core system functionalities
 - Basic interaction flow between users and the system

Remaining portions of the diagram shall be uploaded in Part 3.

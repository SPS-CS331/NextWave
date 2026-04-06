# Test Cases

---

## Black Box Testing Test Cases

Black Box Testing is a software testing technique in which the internal structure, design, or implementation of the system is not known to the tester. The system is tested based on inputs and expected outputs according to the system's functionalities. Key characteristics of black box testing are given below:
 -	Focuses on functionality of the system 
 -	No knowledge of internal code required 
 -	Tests system behaviour from user’s perspective 
 -	Based on requirements and specifications
<br/>

1. **Valid Login / Authentication**
   User must be able to access the dashboard only with valid credentials for role-based accessibility.<br/>
   Input: Correct email, password, and role-ID.<br/>
   Expected Output: Log in successful or unsuccessful depending on user entry.<br/>
2. **Valid Evidence Upload**
   Investigator must not be able upload evidence with same ID.
   Input: Upload evidence with an evidence-ID that has already been used previously.
   Expected Output: File upload is unsuccessful and shows error/alert.
3. **Report Generation**
   Evidence analysis report must be shown only to the corresponding investigator, and not accessible by other users or investigators.
   Input: Completed analysis by forensic investigator, and generate report.
   Expected Output: Downloadable report accessible only to the respective investigator.
<br/>
<br/>
---
<br/>
<br/>
## White Box Testing Test Cases

White Box Testing is a software testing technique in which the internal structure, logic, and code of the system are fully visible to the tester. Key Characteristics of white box testing:
 -	Focuses on internal logic and code structure 
 -	Requires programming knowledge 
 -	Tests conditions, loops, and execution paths 
 -	Performed by developers or testers with code access

1. **Login Condition Check**
   Logic Tested:     **if (email exists && password correct)**
   Test Cases:
    -	Valid email + valid password → success
    -	Valid email + wrong password → fail
    -	Invalid email → fail

2. **Role-Based Access Logic**
   Logic Tested:     **if (role == Admin / Analyst / Investigator)**
   Expected Result: Correct permissions assigned for each role.

3. **File Validation Logic**
   Logic Tested:     **if (file_type == allowed && file_size < limit)**
   Test Cases:
    -	Valid type & size → accept,
    -	Invalid type → reject,
    -	Exceed size → reject.

---

# Test Plan

## 1. Objective of Testing <br/>
The primary objective of testing is to ensure that the **Automated Digital Forensics Evidence Collection and Analysis System** operates in a correct, secure, efficient, and reliable manner under various operating conditions. Testing is performed to validate that the system conforms to its specified functional and non-functional requirements and behaves as expected in real-world scenarios. <br/> <br/>
The key objectives of testing include: <br/>
- **Correct Evidence Handling** <br/>
To verify that digital evidence is properly uploaded, stored, retrieved, and processed without any loss, duplication, or corruption. This is critical since forensic systems must preserve data authenticity. 
- **Accuracy of Forensic Analysis** <br/>
To ensure that the machine learning models and analytical components produce accurate, consistent, and reproducible results. Incorrect analysis could lead to misleading conclusions. 
- **User Authentication and Access Control** <br/>
To confirm that only authorized users can access system functionalities and that role-based permissions (Administrator, Investigator, Analyst) are correctly enforced. 
- **System Stability and Reliability** <br/>
To evaluate whether the system performs consistently without crashes, failures, or unexpected behavior during normal and edge-case operations. 
- **Performance Evaluation** <br/>
To assess how efficiently the system handles tasks such as large file uploads, preprocessing, and ML-based analysis. 
- **Data Integrity and Security Assurance** <br/>
To ensure that evidence integrity is maintained using hashing mechanisms and that sensitive data is protected from unauthorized access or tampering. 
- **Compliance with Forensic Standards** <br/>
To verify that the system maintains proper logging (chain of custody), which is essential for legal and investigative purposes. 

---

## 2. Scope of Testing <br/>
The scope of testing defines the boundaries of the testing process and identifies the system components that will be evaluated. For this project, testing covers all major functional modules and their interactions. <br/>
The modules included in the scope are: <br/>
- Check if **an evidence cannot be uploaded with an evidence ID same as some evidence uploaded before**.
- Check if **only the analyst to whom an evidence task has been assigned, gets the task of running the model**. Other analysts should not get it.
- Check if in uploading cybercrime evidence, the **input file's type is .csv only**, nothing else is allowed.
- Check if **the same fingerprint image is being input in the face-fingerprint recognition evidence, then the output shall be the same face image** (though confidence score may vary).
- Check if in the wearable biometrics evidence input fields, **investigator is allowed to enter numeric inputs only**, strings are not allowed.
- Check if **there cannot be multiple system administrators accounts**, only one administrator is allowed.
- Check **if the same fingerprint image is given again, then the model is not running again**, but just giving the previously run output for same fingerprint.
- Check if in the wearable biometrics evidence upload, **there should not be any empty field. If there is , the form will not submit**.

---

## 3. Types of Testing <br/>
A combination of different testing methodologies is used to ensure complete system validation: <br/>
- **Unit Testing** <br/>
Individual components such as role-based access, login logic, and file validation are tested in isolation to verify correctness. 
- **Integration Testing** <br/>
Ensures proper interaction between modules, such as: <br/>
	- Evidence upload → preprocessing 
	- Preprocessing → ML analysis 
	- Analysis → report generation 
- **System Testing** <br/>
The entire system is tested as a whole to validate complete workflows and ensure all components work together seamlessly. 
- **Validation Testing** <br/>
Ensures that all inputs conform to required formats and constraints, preventing invalid or malicious data entry. 
- **Security Testing** <br/>
Verifies authentication mechanisms, role-based access control, and protection against unauthorized access and data breaches.
- **Performance Testing** <br/>
Evaluates system responsiveness and efficiency during operations such as large file uploads and ML processing. 
- **Regression Testing** <br/>
Ensures that new updates or bug fixes do not affect existing functionalities. 

---

## 4. Tools Used <br/>
The following tools and technologies are used to perform effective testing:
- **Manual Testing** <br/>
The primary method that is used to validate our system's behaviour, especially in cases of Utility Testing, from an end-user perspective, is done by manually testing the system. 
- **JavaScript Testing Utilities**, specifically the **Mocha** library <br/>
We have used the Mocha utility, a specific testing utility in JavaScript, for testing backend logic, ML modules, data processing functions, and overall system behaviour. 
- **Postman (API Testing Tool)** <br/>
Tools like Postman and Curl are used to test RESTful APIs, verify request-response cycles, async-await functions, and ensure proper communication between frontend and backend.
- **Browser Developer Tools** <br/>
These are used for debugging frontend issues, monitoring network calls, and verifying UI interactions. 
- **Logging Mechanisms** <br/>
We are using console logs at differwnt locations across our codebase, for the purpose of tracking system behaviour, debug issues, and analyze failures. 

---

## 5. Entry Criteria <br/>
The entry criteria specify the conditions that must be satisfied before testing can begin:
- All core modules of the system are implemented 
- Code integration between frontend, backend, and ML components is completed 
- Test environment (local server or cloud) is properly configured 
- Sample datasets and test inputs are available 
- APIs are functional and accessible 
- Basic system operations are verified (smoke testing completed)  <br/>
These conditions ensure that the system is ready for structured testing.

---

## 6. Exit Criteria <br/>
The exit criteria define when the testing process can be considered complete:
- All planned test cases have been executed successfully 
- Critical and high-severity defects have been identified and resolved 
- System meets all functional and non-functional requirements 
- Performance is within acceptable limits 
- No major security vulnerabilities remain 
- Test results are documented and validated <br/>
This ensures that the system is reliable and ready for deployment or demonstration.

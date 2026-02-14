# CS 331 – Software Engineering Lab Assignment 4 Part A Only

## Architectural Design: Layered Architecture

### Architecture Style Adopted: Layered Architecture

We adopt a Layered Architecture because the system is divided into clearly separated functional layers where each layer performs a specific responsibility and communicates only with adjacent layers.

This ensures:
- Maintainability  
- Scalability  
- Separation of Concerns  
- Easier Testing and Debugging  

Our Digital Forensics System is structured into logical layers to ensure clean organization of forensic workflows and secure data handling.

---

## Overall Layer Structure

          Presentation Layer (React Frontend)  
                          ↓  
          Application / Business Logic Layer (Node.js / Express)  
                          ↓  
          Machine Learning / Analysis Layer  
                          ↓  
          Data Access Layer (Mongoose Models)  
                          ↓  
          Database Layer (MongoDB)

---

## 1. Presentation Layer (UI Layer)

**Granularity:** User Interaction Components

### Responsibilities:
- Provides User Interface  
- Evidence Upload Screens  
- Results Visualization  
- Report Viewing  

### Example Components:
- Login Interface  
- Dashboard  
- Evidence Upload Module  
- Visualization Panels  

---

## 2. Application / Business Logic Layer

**Granularity:** Functional Processing Modules

### Responsibilities:
- Evidence Handling Logic  
- Forensic Workflow Management  
- Integrity Verification  
- Report Generation Logic  
- Chain of Custody Maintenance  

### Example Components:
- Evidence Management Module  
- Evidence Preprocessing Module  
- Forensic Analysis Module  
- Report Generation Module  
- Chain of Custody Module  

---

## 3. Machine Learning / Analysis Layer

**Granularity:** Analytical Processing Components

### Responsibilities:
- Machine Learning Model Execution  
- Feature Extraction  
- Evidence Classification  
- Prediction Generation  

### Example Components:
- ML Inference Engine  
- Model Loader  
- Prediction Engine  

---

## 4. Data Layer (Persistence Layer)

**Granularity:** Data Storage Components

### Responsibilities:
- Evidence Storage  
- User Information Management  
- Reports Storage  
- Audit Logging  

### Example Components:
- Evidence Database  
- User Database  
- Reports Repository  
- Audit Logs  

---

## Advantages of This Architecture

- Ensures forensic integrity and traceability  
- Supports independent development of layers  
- Allows scaling of ML components separately  
- Simplifies maintenance and updates  
- Enables layer-wise testing  
- Maintains clear Chain of Custody  

---

## Conclusion

The Layered Architecture provides a structured, secure, and scalable foundation for building a Digital Forensics System, ensuring proper evidence handling, modular development, and long-term maintainability.

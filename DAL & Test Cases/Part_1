# Data Access Layer (DAL)

## 1. Introduction to DAL

The Data Access Layer (DAL) is an architectural component that acts as a bridge between application logic and the database.

### Purpose:
- Abstract database operations  
- Encapsulate data access logic  
- Prevent direct database interaction  

This follows the principle of **Separation of Concerns**, making the system:
- Easier to maintain  
- More secure  
- More scalable  

---

## 2. Role of DAL in the Application

The DAL is responsible for:

- Performing CRUD operations (Create, Read, Update, Delete)  
- Managing database connections  
- Enforcing data consistency and validation  
- Handling queries and transactions  

All database-related logic is centralized in this layer instead of being scattered across the application.

---

## 3. DAL in Forensics Project

### Technologies Used:
- MongoDB → Database  
- Mongoose → Object Data Modeling (ODM)

### Why MongoDB + Mongoose?

- MongoDB stores data in JSON-like documents  
- Mongoose provides:
  - Schema definition  
  - Data validation  
  - Easy querying methods  
  - Relationship handling  

---

## 4. Database Creation and Connection

The backend connects to the database using:

```js
mongoose.connect(MONGO_URI);
```

---

## 5. Collections and Schema Design

### MongoDB Mapping:
- Tables → Collections  
- Rows → Documents  

### Models Location:
```
backend/models/
```

---

## 6. Main Models

### User.js  
<p align="center">
  <img src="images/user.png" width="850"/>
</p>

### Dataset.js  
<p align="center">
  <img src="images/data.png" width="850"/>
</p>

### Evidence.js  
<p align="center">
  <img src="images/evidence.png" width="850"/>
</p>

### Analysis.js  
<p align="center">
  <img src="images/analysis.png" width="850"/>
</p>

### Report.js  
<p align="center">
  <img src="images/report.png" width="850"/>
</p>

### Log.js  
<p align="center">
  <img src="images/logs.png" width="850"/>
</p>

---

### What Each Model Defines:
- Field names and data types  
- Required fields  
- Default values  
- Relationships (references)  

### Example Schema:

```js
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});
```

---

## 7. DAL Usage in Project Files

### Authentication (routes/auth.js)
- `findOne()` → Check if user exists  
- `create()` → Register new user  

---

### Dataset Management (routes/datasets.js)
- `create()` → Add dataset  
- `find()` → Fetch datasets  
- `findByIdAndUpdate()` → Update dataset  
- `findByIdAndDelete()` → Delete dataset  

---

### Evidence Handling (routes/evidence.js)
- Stores digital evidence  
- Links evidence with analysis data  

---

### Report Handling (routes/reports.js)
- Retrieves reports  
- Uses `.populate()` to join related collections  

```js
Report.find().populate('user dataset');
```

---

## 8. Logging System (utils/logger.js)

- Stores logs in Log collection  

### Helps in:
- Audit tracking  
- Debugging  
- Monitoring system activity  

---

## 9. Error Handling

The DAL manages:
- Missing fields  
- Invalid queries  
- Database connection issues  

Errors are handled and passed to the application layer in a structured format.

---

## 10. Importance of DAL

### Separation of Concerns
Keeps database logic separate from application logic  

### Security
Prevents direct database access  

### Maintainability
Changes required only in DAL  

### Scalability
Supports future system expansion efficiently  

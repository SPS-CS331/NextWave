import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
    specialization: "",
  });

  const [showPopup, setShowPopup] = useState(false);
  const [generatedId, setGeneratedId] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await axios.post("http://localhost:5000/api/auth/signup", form);
    setGeneratedId(res.data.roleId);
    setShowPopup(true);
  }

  function closePopup() {
    setShowPopup(false);
    navigate("/login");
  }

  return (
    <div>
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <select name="role" onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="Administrator">Administrator</option>
          <option value="Investigator">Investigator</option>
          <option value="Analyst">Analyst</option>
        </select>

        {form.role === "Investigator" && (
          <input
            name="department"
            placeholder="Department"
            onChange={handleChange}
          />
        )}

        {form.role === "Analyst" && (
          <input
            name="specialization"
            placeholder="Specialization"
            onChange={handleChange}
          />
        )}

        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already have an account? <a href="/login">Login</a>
      </p>

      <a href="http://localhost:5000/auth/google">
        Sign up with Google
      </a>

      {showPopup && (
        <div onClick={closePopup}>
          <div
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Your System Generated ID</h3>
            <p>{generatedId}</p>
            <p>Please save this ID. You’ll need it to login.</p>
          </div>
        </div>
      )}
    </div>
  );
}

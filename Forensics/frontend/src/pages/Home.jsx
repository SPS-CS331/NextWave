import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div style={styles.page}>
      <h1>Hi!</h1>

      <div style={styles.circleContainer}>
        <button style={styles.circleButton}>
          Face Recognition
        </button>

        <button style={styles.circleButton}>
          Fingerprint Recognition
        </button>

        <button style={styles.circleButton}>
          Blood Analysis
        </button>
      </div>

      <footer style={styles.footer}>
        <button onClick={logout}>Logout</button>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "40px",
  },

  circleContainer: {
    display: "flex",
    gap: "40px",
    marginTop: "40px",
  },

  circleButton: {
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    border: "2px solid #333",
    backgroundColor: "#f5f5f5",
    textAlign: "center",
    padding: "20px",
  },

  footer: {
    marginBottom: "20px",
  },
};
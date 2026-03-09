import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DatasetViewer from "./pages/DatasetViewer";
import UploadEvidence from "./pages/UploadEvidence";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Dashboard />} />
      <Route path="/upload-evidence" element={<UploadEvidence />} />
      <Route path="/datasets/view" element={<DatasetViewer />} />
    </Routes>
  );
}

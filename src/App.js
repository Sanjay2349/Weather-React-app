import "./App.css";
import { Route, Routes } from "react-router-dom";
import Traveller from "./Components/Traveller";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Traveller />} />
    </Routes>
  );
}

export default App;

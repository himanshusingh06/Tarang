import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import Library from "./pages/Library";
import ChakraJourney from "./pages/ChakraJourney";
import Schedule from "./pages/Schedule";
import Diagnostic from "./pages/Diagnostic";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Player from "./pages/Player";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminProgramDetail from "./pages/AdminProgramDetail";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/library" element={<Library />} />
        <Route path="/chakra" element={<ChakraJourney />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/diagnostic" element={<Diagnostic />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        <Route path="/admin/programs/:id" element={<AdminProgramDetail />} />
        <Route path="/player/:id" element={<Player />} />
      </Routes>
    </div>
  );
}

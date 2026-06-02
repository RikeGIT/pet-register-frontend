import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const hideChromePaths = ["/login", "/register", "/otp"];
  const isAdminPath = location.pathname.startsWith("/admin");
  const shouldHideChrome =
    hideChromePaths.includes(location.pathname) || isAdminPath;

  return (
    <>
      {!shouldHideChrome && <Navbar />}
      <AppRoutes />
      {!shouldHideChrome && <Footer />}
    </>
  );
}

export default App;

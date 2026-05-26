import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <AppRoutes />
    </>
  );
}

export default App;

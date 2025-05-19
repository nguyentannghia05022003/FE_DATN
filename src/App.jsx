import { useContext, useEffect } from "react";
import { AuthContext } from "./components/context/auth.context";
import { Spin } from "antd";
import { getAccountApi } from "./services/api.service";
import Header from "./components/layout/header";

const App = () => {
  const { setUser, isAppLoading, setIsAppLoading, darkMode } =
    useContext(AuthContext);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Áp dụng chế độ sáng/tối cho toàn ứng dụng
  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
  }, [darkMode]);

  const fetchUserInfo = async () => {
    const res = await getAccountApi();
    if (res.data) {
      setUser(res.data.user);
    }
    setIsAppLoading(false);
  };

  return (
    <>
      {isAppLoading ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Spin />
        </div>
      ) : (
        <>
          <Header />
        </>
      )}
    </>
  );
};

export default App;
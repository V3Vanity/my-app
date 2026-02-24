import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./HistoryPage.css";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleMenuItemClick = (page) => {
    setMenuOpen(false);
    switch (page) {
      case "quest":
        navigate("/quest");
        break;
      case "temples":
        navigate("/temples");
        break;
      case "museums":
        navigate("/museums");
        break;
      case "art":
        navigate("/art");
        break;
      case "history":
        navigate("/history");
        break;
      case "family":
        navigate("/family");
        break;
      case "gastro":
        navigate("/gastro");
        break;
      case "about":
        navigate("/about");
        break;
      case "reviews":
        navigate("/reviews");
        break;
      default:
        navigate("/");
        break;
    }
  };

  return (
    <>
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onMenuItemClick={handleMenuItemClick}
      />
      <div className="page-container">
        <h1>История</h1>
        <div className="page-content">
          <p>Страница истории находится в разработке</p>
          <p>Здесь будут представлены исторические места и события</p>
        </div>
      </div>
    </>
  );
}

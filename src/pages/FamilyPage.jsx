import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./FamilyPage.css";

export default function FamilyPage() {
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
        <h1>Для семьи</h1>
        <div className="page-content">
          <p>Страница для семьи находится в разработке</p>
          <p>Здесь будут представлены места для семейного отдыха</p>
        </div>
      </div>
    </>
  );
}

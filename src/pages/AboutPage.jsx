import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./AboutPage.css";

export default function AboutPage() {
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
        <h1>О нас</h1>
        <div className="page-content">
          <p>Страница о нас находится в разработке</p>
          <p>Здесь будет информация о нашей команде и проекте</p>
        </div>
      </div>
    </>
  );
}

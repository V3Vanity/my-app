import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./ReviewsPage.css";

export default function ReviewsPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleMenuItemClick = (page) => {
    setMenuOpen(false);
    switch (page) {
      case "quest":
        navigate("/app/quest");
        break;
      case "temples":
        navigate("/app/temples");
        break;
      case "museums":
        navigate("/app/museums");
        break;
      case "art":
        navigate("/app/art");
        break;
      case "history":
        navigate("/app/history");
        break;
      case "family":
        navigate("/app/family");
        break;
      case "gastro":
        navigate("/app/gastro");
        break;
      case "about":
        navigate("/app/about");
        break;
      case "reviews":
        navigate("/app/reviews");
        break;
      default:
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
        <h1>Отзывы</h1>
        <div className="page-content">
          <p>Страница отзывов находится в разработке</p>
          <p>Здесь будут отзывы наших гостей</p>
        </div>
      </div>
    </>
  );
}

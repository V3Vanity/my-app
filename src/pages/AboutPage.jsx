import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./AboutPage.css";

export default function AboutPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Блокировка скролла body при открытом меню
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

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

      <div className="about-page-container">
        <div className="about-content">
          <p className="greeting">
            Привет! Очень рады видеть вас здесь и познакомиться поближе ❤️
          </p>

          <p>
            Меня зовут Юля, и вместе с моим мужем Димой мы создали этот сайт с
            большой любовью к Костроме и её окрестностям.
          </p>

          <p>
            Этот проект появился из простого желания — помочь людям не тратить
            время на бесконечные поиски и увидеть как можно больше нашего
            прекрасного города. Мы постарались собрать всё в одном месте:
            квест-экскурсии, прогулочные маршруты, гастрономические точки, храмы
            и музеи, чтобы знакомство с Костромой было лёгким, интересным и
            по-настоящему тёплым.
          </p>

          <p>
            Я — графический дизайнер и отвечаю за визуальную часть проекта,
            атмосферу и настроение сайта. Дима — программист, благодаря которому
            все идеи работают так, как задумано. Этот сайт также является частью
            моей дипломной работы, и для меня он особенно важен — в него вложено
            много сил, времени и искренней любви к городу.
          </p>

          <p>
            Нам очень важно ваше мнение. Мы будем искренне рады, если вы будете
            оставлять отзывы, делиться впечатлениями и подсказывать, что можно
            сделать лучше. Именно благодаря вам проект сможет расти, развиваться
            и становиться ещё удобнее и интереснее.
          </p>

          <p>Также с нами всегда можно связаться по почте:</p>

          <p className="email">korobkoulia05@mail.ru</p>

          <p className="signature">
            Спасибо, что вы здесь. Надеемся, этот сайт поможет вам почувствовать
            Кострому такой, какой любим её мы — уютной, душевной и живой.
          </p>
        </div>
      </div>
    </>
  );
}

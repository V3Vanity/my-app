// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainApp from "./pages/main";
import "./App.css";

// Импорт изображений
import aboutTitleSvg from "./assets/about-title.svg";
import aboutIconSvg from "./assets/about-icon.svg";
import aboutRightImage from "./assets/about-right-image.png";
import phoneAboutSvg from "./assets/phone-about.svg";
// Удаляем неиспользуемый импорт demoVideo
// import demoVideo from "./assets/demo-video.mov";

function App() {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const accessToken = localStorage.getItem("app_access");
    if (accessToken) {
      setHasAccess(true);
    }
    setIsLoading(false);
  }, []);

  // Плавная прокрутка к секции
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  // Лендинг с шапкой
  const LandingPage = () => {
    // Эффект при скролле
    useEffect(() => {
      const handleScroll = () => {
        const header = document.querySelector(".landing-header");
        if (window.scrollY > 50) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
      <div className="landing">
        {/* Шапка */}
        <header className="landing-header">
          <div className="header-container">
            <nav className="nav-menu">
              <button
                className={`nav-link ${activeSection === "about" ? "active" : ""}`}
                onClick={() => scrollToSection("about")}
              >
                О нас
              </button>
              <button
                className={`nav-link ${activeSection === "reviews" ? "active" : ""}`}
                onClick={() => scrollToSection("reviews")}
              >
                Отзывы
              </button>
              <button
                className={`nav-link ${activeSection === "features" ? "active" : ""}`}
                onClick={() => scrollToSection("features")}
              >
                Что вас ждёт
              </button>
              <button
                className={`nav-link ${activeSection === "pricing" ? "active" : ""}`}
                onClick={() => scrollToSection("pricing")}
              >
                Купить
              </button>
            </nav>
          </div>
        </header>

        {/* Секция "О нас" */}
        <section id="about" className="landing-about-section">
          <div className="landing-about-content">
            {/* Левая колонка с текстом */}
            <div className="landing-about-left">
              <div className="landing-about-card">
                {/* Заголовок - изображение SVG */}
                <div className="landing-about-title-icon">
                  <img
                    src={aboutTitleSvg}
                    alt="Изображение"
                    className="landing-about-title-svg"
                  />
                </div>
                <p className="landing-about-description">
                  Посетите самые значимые места города, попробуйте местную кухню
                  и ни секунды не тратьте на раздумья: Куда сходить? Что поесть?
                  Чем заняться?
                </p>
                <button
                  className="landing-about-btn"
                  onClick={() => scrollToSection("pricing")}
                >
                  Купить
                </button>
              </div>

              <div className="landing-about-info-block">
                {/* Иконка - изображение SVG */}
                <div className="landing-about-info-icon">
                  <img
                    src={aboutIconSvg}
                    alt="Иконка"
                    className="landing-about-icon-svg"
                  />
                </div>
                <p className="landing-about-info-text">
                  Электронный гид по Костроме состоит из: Квест-экскурсии
                  «Мазайские зайцы», гастро-тура по ресторанам и культурной
                  карты храмов, музеев и семейных развлечений.
                </p>
              </div>
            </div>

            {/* Правая колонка с изображением */}
            <div className="landing-about-right">
              <img
                src={aboutRightImage}
                alt="О нас"
                className="landing-about-image"
              />
            </div>
          </div>
        </section>

        {/* Секция "Что внутри?" */}
        <section id="features" className="landing-features-section">
          <div className="landing-features-content">
            {/* Левая часть с текстом */}
            <div className="landing-features-left">
              <h2 className="landing-features-title">Что внутри ?</h2>

              <div className="landing-features-item">
                <h3 className="landing-features-item-title">
                  КВЕСТ-ЭКСКУРСИЯ “МАЗАЙСКИЕ ЗАЙЦЫ”
                </h3>
                <p className="landing-features-item-text">
                  Фигурки зайцев расставлены по центру Костромы. Каждая из них
                  символизирует профессию прошлых лет и находится рядом с
                  историческими зданиями. Во время квеста вы не просто пройдёте
                  по точкам, а в игровом формате узнаете историю домов и улиц,
                  по которым проходит маршрут.
                </p>
              </div>

              <div className="landing-features-item">
                <h3 className="landing-features-item-title">“ГАСТРО-ТУР”</h3>
                <p className="landing-features-item-text">
                  Подборка лучших кафе и ресторанов в центре города. У каждого
                  места — фирменное костромское блюдо, которое стоит попробовать
                  именно здесь.
                </p>
              </div>

              <div className="landing-features-item">
                <h3 className="landing-features-item-title">
                  “КУЛЬТУРНАЯ КАРТА”
                </h3>
                <p className="landing-features-item-text">
                  Все ключевые точки города в одном месте: от храмов и галерей
                  до исторических локаций и семейных активностей за пределами
                  центра.
                </p>
              </div>
            </div>

            {/* Правая часть с телефоном и видео */}
            <div className="landing-features-right">
              <div className="landing-phone-frame">
                <img
                  src={phoneAboutSvg}
                  alt="Телефон"
                  className="landing-phone-image"
                />
                <div className="landing-video-container">
                  <video
                    className="landing-demo-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls // Добавим для теста, чтобы видеть управление
                  >
                    <source src="/demo-video.mp4" type="video/mp4" />
                    Ваш браузер не поддерживает видео.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Секция "Отзывы" (заглушка) */}
        <section id="reviews" className="section">
          <div className="container">
            <h2>Отзывы</h2>
            <p>Секция "Отзывы" будет добавлена позже</p>
          </div>
        </section>

        {/* Секция "Купить" (заглушка) */}
        <section id="pricing" className="section">
          <div className="container">
            <h2>Купить доступ</h2>
            <p>Секция "Купить" будет добавлена позже</p>
          </div>
        </section>
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/app/*"
          element={hasAccess ? <MainApp /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

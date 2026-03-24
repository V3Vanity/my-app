// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainApp from "./pages/main";
import "./App.css";

import aboutTitleSvg from "./assets/about-title.svg";
import aboutIconSvg from "./assets/about-icon.svg";
import aboutRightImage from "./assets/about-right-image.png";
import phoneAboutSvg from "./assets/phone-about.svg";
import feelingTitleSvg from "./assets/feeling-title.svg";
import feelingImage from "./assets/feeling-image.svg";
import guideImage from "./assets/guide-image.svg";
import featuresTitleSvg from "./assets/features-title.svg";
import featureIcon1 from "./assets/feature-icon-1.svg";
import featureIcon2 from "./assets/feature-icon-2.svg";
import featureIcon3 from "./assets/feature-icon-3.svg";
import comparisonLeftSvg from "./assets/comparison-left.svg";
import comparisonRightSvg from "./assets/comparison-right.svg";
import reviewIcon1 from "./assets/review-icon-1.svg";
import reviewIcon2 from "./assets/review-icon-2.svg";
import phoneCitySvg from "./assets/phone-city.svg";

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
                    controls
                  >
                    <source src="/demo-video.mp4" type="video/mp4" />
                    Ваш браузер не поддерживает видео.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Новая секция: "Вам тоже знакомо это чувство?" */}
        <section className="landing-feeling-section">
          <div className="landing-feeling-container">
            <img
              src={feelingTitleSvg}
              alt="Заголовок"
              className="landing-feeling-title"
            />
            <div className="landing-feeling-content">
              <div className="landing-feeling-left">
                <h3>Вам тоже знакомо?</h3>
                <p className="landing-feeling-text">
                  Когда перед поездкой голова идёт кругом:<br></br> что
                  обязательно посмотреть, куда бежать, если время ограничено, и
                  как сделать так, чтобы отдых понравился и подростку, и
                  бабушке, и вам самим?
                </p>
              </div>
              <div className="landing-feeling-right">
                <img
                  src={feelingImage}
                  alt="Изображение"
                  className="landing-feeling-image"
                />
              </div>
            </div>
          </div>
        </section>
        {/* Новая секция: "Мы создали гид" */}
        <section className="landing-guide-section">
          <div className="landing-guide-content">
            <div className="landing-guide-left">
              <img
                src={guideImage}
                alt="Изображение"
                className="landing-guide-image"
              />
            </div>
            <div className="landing-guide-right">
              <h3>Мы создали гид, чтобы вы забыли об этих вопросах.</h3>
              <p className="landing-guide-text">
                Ни разу за поездку у вас не возникнет мыслей:<br></br> «как всем
                угодить?», «как успеть всё?», «где поесть, чтобы было вкусно и
                без сюрпризов?», «как провести время всей семьёй, чтобы никто не
                заскучал?». Просто выбирайте маршрут, гуляйте и получайте
                удовольствие.
              </p>
            </div>
          </div>
        </section>

        {/* Секция с тремя фичами */}
        <section className="landing-features-grid-section">
          <img
            src={featuresTitleSvg}
            alt="Заголовок"
            className="landing-features-grid-title"
          />
          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <img
                src={featureIcon1}
                alt="Иконка"
                className="landing-feature-icon"
              />
              <p className="landing-feature-text">
                Путешествуйте по городу, раскрывайте тайны Костромы и собирайте
                Мазайских зайцев
              </p>
            </div>
            <div className="landing-feature-card">
              <img
                src={featureIcon2}
                alt="Иконка"
                className="landing-feature-icon"
              />
              <p className="landing-feature-text">
                Исследуйте культурную карту, познакомьтесь с местным искусством
              </p>
            </div>
            <div className="landing-feature-card">
              <img
                src={featureIcon3}
                alt="Иконка"
                className="landing-feature-icon"
              />
              <p className="landing-feature-text">
                Выбирайте из лучших мест и попробуйте местную кухню
              </p>
            </div>
          </div>
        </section>

        {/* Секция: самостоятельно vs с гидом */}
        <section className="landing-comparison-section">
          <h2 className="landing-comparison-title">
            самостоятельно vs с гидом
          </h2>
          <div className="landing-comparison-content">
            <div className="landing-comparison-left">
              <img
                src={comparisonLeftSvg}
                alt="Самостоятельно"
                className="landing-comparison-image"
              />
            </div>
            <div className="landing-comparison-right">
              <img
                src={comparisonRightSvg}
                alt="С гидом"
                className="landing-comparison-image"
              />
            </div>
          </div>
        </section>

        {/* Секция "Отзывы" */}
        <section id="reviews" className="landing-reviews-section">
          <div className="landing-reviews-container">
            <h2 className="landing-reviews-title">Отзывы</h2>
            <div className="landing-reviews-grid">
              {/* Ряд 1 - 3 отзыва */}
              <div className="landing-reviews-row">
                <div className="landing-review-card">
                  <div className="landing-review-icon">
                    <img
                      src={reviewIcon1}
                      alt="иконка"
                      className="review-icon-svg"
                    />
                  </div>
                  <div className="landing-review-content">
                    <p className="landing-review-text">
                      "Очень удобный гид! Всё структурировано, подсказки по
                      маршрутам и интересные факты делают поездку намного проще
                      и увлекательнее."
                    </p>
                  </div>
                </div>

                <div className="landing-review-card">
                  <div className="landing-review-icon">
                    <img
                      src={reviewIcon2}
                      alt="иконка"
                      className="review-icon-svg"
                    />
                  </div>
                  <div className="landing-review-content">
                    <p className="landing-review-text">
                      "Очень полезно для путешествий с детьми. Электронный гид
                      легко использовать, есть короткие пояснения и интересные
                      истории, дети были в восторге!"
                    </p>
                  </div>
                </div>

                <div className="landing-review-card">
                  <div className="landing-review-icon">
                    <img
                      src={reviewIcon1}
                      alt="иконка"
                      className="review-icon-svg"
                    />
                  </div>
                  <div className="landing-review-content">
                    <p className="landing-review-text">
                      "Никаких лишних деталей, только нужная информация. Помог
                      быстро спланировать день, ничего не упустил."
                    </p>
                  </div>
                </div>
              </div>

              {/* Ряд 2 - 3 отзыва */}
              <div className="landing-reviews-row">
                <div className="landing-review-card">
                  <div className="landing-review-icon">
                    <img
                      src={reviewIcon2}
                      alt="иконка"
                      className="review-icon-svg"
                    />
                  </div>
                  <div className="landing-review-content">
                    <p className="landing-review-text">
                      "Гид понравился! Информация актуальная, фотографии
                      помогают сориентироваться, а аудиозаписи делают экскурсию
                      живой и интересной."
                    </p>
                  </div>
                </div>

                <div className="landing-review-card">
                  <div className="landing-review-icon">
                    <img
                      src={reviewIcon1}
                      alt="иконка"
                      className="review-icon-svg"
                    />
                  </div>
                  <div className="landing-review-content">
                    <p className="landing-review-text">
                      "Лучший гид, который у меня был! Интуитивно понятный
                      интерфейс, рекомендации по кафе и интересным местам очень
                      пригодились."
                    </p>
                  </div>
                </div>

                <div className="landing-review-card">
                  <div className="landing-review-icon">
                    <img
                      src={reviewIcon2}
                      alt="иконка"
                      className="review-icon-svg"
                    />
                  </div>
                  <div className="landing-review-content">
                    <p className="landing-review-text">
                      "Купил электронный гид перед путешествием — реально
                      сэкономил время и силы. Все места отмечены, карта
                      интерактивная, подробные советы по
                      достопримечательностям."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Секция "Влюбились? Мы поможем спланировать" */}
        <section className="landing-city-video-section">
          <div className="landing-city-video-container">
            <h2 className="landing-city-video-title">
              Влюбились? Мы поможем спланировать.
              <br />
              Квесты, рестораны, музеи — весь город на одном сайте.
            </h2>
            <div className="landing-city-phone-frame">
              <img
                src={phoneCitySvg}
                alt="Телефон"
                className="landing-city-phone-image"
              />
              <div className="landing-city-video-wrapper">
                <video
                  className="landing-city-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                >
                  <source src="/city-video.mp4" type="video/mp4" />
                  Ваш браузер не поддерживает видео.
                </video>
              </div>
            </div>
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

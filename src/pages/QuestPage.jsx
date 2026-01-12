import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import TextBlock from "../components/TextBlock.jsx";
import MapCanvas from "../components/MapCanvas.jsx";
import topImage from "../assets/marshrut44.png";
import questImage from "../assets/quest-img.png";
import "./QuestPage.css";

export default function QuestPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = стартовый экран
  const navigate = useNavigate();
  const mapRef = useRef(null);

  useEffect(() => {
    if (currentStep === 2 && mapRef.current) {
      mapRef.current.startQuest();
      mapRef.current.buildRouteToStart();
    }
  }, [currentStep]);

  // Сохраняем прогресс только если текущий шаг > 0
  useEffect(() => {
    if (currentStep > 0) {
      localStorage.setItem("questStep", currentStep);
    }
  }, [currentStep]);

  const navigateTo = (page) => {
    switch (page) {
      case "quest":
        navigate("/quest");
        break;
      case "temples":
        navigate("/temples");
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
        break;
    }
  };

  const handleStartJourney = () => {
    setCurrentStep(1); // начинаем квест с первого текстового шага
  };

  const handleNextStep = () => setCurrentStep((prev) => prev + 1);

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0); // возвращаемся на стартовый экран
    } else if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleQuestPointReached = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const step1Text = `Маршрут №44
Они не раскрывают её сразу, но ведут
за собой тех, кто способен видеть, слушать и замечать детали, на которые обычный взгляд не обратит внимания.
Следуй за ними — через набережные, дворы и старые улицы. Каждый мазайский заяц — это намёк, загадка, след, который ведёт к большему. Тайна, которую они хранят, велика, и узнать её полностью можно лишь пройдя весь путь до конца.

Готов ли ты отправиться по следу хранителей, внимать их знакам и раскрыть секреты, которые город хранил веками?
Вступай, путник, в город, где прошлое
не спит, а улицы шепчут о событиях,
что случались века назад. Здесь, среди старых домов и набережных, спрятаны истории, которые не слышит большинство прохожих. Но для тех, кто умеет наблюдать, город открывает свои тайны.

Весной, когда Волга разливается и вода касается берегов, вспоминают Мазая
— старика, который выходил на лодке
и спасал зайцев с затопленных островов.  
История эта известна каждому, но её продолжение живёт в Костроме до сих пор.
Некоторые из спасённых зайцев остались в городе. Они превратились в хранителей — маленьких наблюдателей, внимательных и осторожных. Их называют мазайскими зайцами, и каждый из них словно хранит частицу древней тайны.`;

  return (
    <div className="app-container">
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        navigateTo={navigateTo}
      />

      {currentStep === 0 ? (
        // Стартовый экран квеста
        <>
          <div className="top-image-container">
            <img src={topImage} alt="Топ" />
          </div>

          <div style={{ padding: "16px", textAlign: "center" }}>
            <button
              onClick={handleStartJourney}
              style={{
                padding: "12px 24px",
                backgroundColor: "#862518",
                color: "#d9cfb8",
                fontSize: "16px",
                fontWeight: "bold",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Начать путешествие
            </button>
          </div>

          <div className="quest-image-container">
            <img src={questImage} alt="Квест" />
          </div>
        </>
      ) : (
        <>
          {currentStep === 1 && (
            <TextBlock
              text={step1Text}
              showTitle={true}
              onNextStep={handleNextStep}
              showBackButton={true}
              onBack={handleBack}
            />
          )}

          {currentStep === 2 && (
            <MapCanvas
              ref={mapRef}
              onBack={handleBack}
              onQuestPointReached={handleQuestPointReached}
            />
          )}
        </>
      )}
    </div>
  );
}

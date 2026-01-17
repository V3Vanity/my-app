import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import TextBlock from "../components/TextBlock.jsx";
import MapCanvas from "../components/MapCanvas.jsx";
import topImage from "../assets/marshrut44.png";
import questImage from "../assets/quest-img.png";
import step2Image from "../assets/step-2.png";
import "./QuestPage.css";

export default function QuestPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem("questStep");
    return saved ? Number(saved) : 0;
  });
  const [completedSteps, setCompletedSteps] = useState([]);
  const [foundQuestPoints, setFoundQuestPoints] = useState([]);
  const navigate = useNavigate();
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (currentStep === 2 && mapRef.current) {
      mapRef.current.startQuest();
      mapRef.current.buildRouteToStart();
    }

    if (currentStep === 4) {
      mapRef.current.startQuest();
      mapRef.current.buildRouteFromStartToSecondPoint();
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

  const handleQuestPointReached = (stepNumber) => {
    // Добавляем точку в список найденных
    setFoundQuestPoints((prev) => {
      if (!prev.includes(stepNumber)) {
        return [...prev, stepNumber];
      }
      return prev;
    });

    // Добавляем точку в completedSteps
    setCompletedSteps((prev) => {
      if (!prev.includes(stepNumber)) {
        return [...prev, stepNumber];
      }
      return prev;
    });

    // Автоматически переходим на следующий шаг
    setCurrentStep(stepNumber + 1);
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
              completedSteps={completedSteps}
            />
          )}
        </>
      )}

      {currentStep === 3 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
        >
          <p className="text-paragraph">
            Ты идёшь по проспекту Мира — старой, широкой улице, где дома словно
            хранят дыхание прошлых веков. Здесь, среди рядов старинных зданий,
            твой взгляд останавливается на небольшом существе: это Почтальон,
            первый из мазайских зайцев. Он стоит прямо на фасаде дома. На нём
            аккуратная шапочка, через плечо перекинут портфель, а рядом на стене
            висит маленький почтовый ящик. Его глаза блестят живым огоньком, и
            кажется, что он вот-вот двинется. И вдруг — словно ожив! — Почтальон
            шевельнул ушками и слегка наклонил голову, будто приглашая подойти
            ближе. С улицы слышен тихий шум, шаги прохожих, но Почтальон будто
            слышит что-то ещё — шёпот старых домов, звуки, которые знают только
            хранители тайн. Он приподнимает лапку и из портфеля достаёт
            маленький свёрток. Ветер слегка подхватывает его края, и Почтальон
            передаёт его тебе. Ты берёшь письмо и разворачиваешь его. На
            пергаменте красивым, аккуратным почерком написано:
          </p>

          <img src={step2Image} alt="Мазайский заяц" className="text-image" />

          <p className="text-paragraph">
            Почтальон слегка подпрыгнул, будто одобряя твою внимательность, и
            снова замер на фасаде, неподвижный и тихий, как будто его магия
            вновь превратила его в статую. Но ты знаешь: письмо — первый ключ,
            первая подсказка, и именно оно укажет путь дальше. Проспект Мира
            больше не кажется обычной улицей. Каждый дом, каждый фасад, каждый
            фонарь и брусчатка теперь могут хранить тайны, и твой путь только
            начинается. Следуй за подсказкой, и мазайские хранители поведут тебя
            дальше.
          </p>
        </TextBlock>
      )}
      {currentStep === 4 && (
        <MapCanvas
          ref={mapRef}
          mode="step4"
          foundQuestPoints={foundQuestPoints}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
        />
      )}
    </div>
  );
}

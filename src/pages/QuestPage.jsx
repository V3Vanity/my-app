import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import TextBlock from "../components/TextBlock.jsx";
import MapCanvas from "../components/MapCanvas.jsx";
import topImage from "../assets/marshrut44.png";
import questImage from "../assets/quest-img.png";
import step2Image from "../assets/step-2.svg";
import step5Image from "../assets/step-5.svg";
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

    switch (currentStep) {
      case 2:
        mapRef.current.startQuest("step2");
        break;
      case 4:
        mapRef.current.startQuest("step4");
        break;
      case 6:
        mapRef.current.startQuest("step6");
        break;
      default:
        break;
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
    setCurrentStep((prev) => {
      // Step2 → Step3 (Убедитесь, что только после нахождения точки на шаге 2)
      if (prev === 2 && stepNumber === 2) return 3; // Переход на шаг 3, а не 4

      // Step3 → Step4
      if (prev === 3 && stepNumber === 3) return 4; // Переход на шаг 4

      // Step5 → Step6
      if (prev === 5 && stepNumber === 5) return 6; // Переход на шаг 6

      // Step6 → Step7 (или финал)
      if (prev === 6 && stepNumber === 6) return 7; // Переход на шаг 7 (финал)

      // Для всех остальных шагов просто увеличиваем на 1
      if (stepNumber === prev) {
        return prev + 1; // Переход на следующий шаг, если точка на текущем шаге
      }

      return prev; // Иначе остаемся на текущем шаге
    });
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
              mode="step2"
              foundQuestPoints={foundQuestPoints}
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
      {currentStep === 5 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
        >
          <p className="text-paragraph">
            Перед тобой возвышается дом, что старше многих поколений
            костромичей. Его красный кирпич, строгие линии и величественный
            облик помнят больше, чем способны рассказать человеческие голоса.
            Здание это родилось в 1815 году — и с тех пор стоит на проспекте
            Мира, будто страж дороги, ведущей в сердце старой Костромы. Когда-то
            внутри этого дома кипела жизнь. В конце XIX века здесь располагалась
            знаменитая гостиница «Большая Московская». По вечерам из её
            ресторана лились мелодии — и не простые: играл первый и единственный
            в России женский духовой оркестр, удивлявший гостей города. В
            декабре 1904 года стены дома слышали речь Якова Свердлова,
            прозвучавшую здесь на торжественном вечере. После революции дом стал
            административным: здесь размещались губфинотдел, комитет комсомола,
            городские управления. Потом наступили долгие годы тишины — здание
            пустело и ветшало, словно заснувшее в своей собственной истории. Но
            в 2023 году дом вновь ожил: после большой реставрации внутри него
            открылся ресторан-сыроварня, и теперь его окна снова светятся, а
            жизнь течёт по этажам, как прежде — только иначе. И именно здесь, у
            фасада этого пережившего эпохи дома, стоит Зайчиха Трубач. Её
            маленькая фигурка будто впитала в себя все звуки, что когда-то
            звучали под этими стенами — от оркестровых мелодий до шагов
            путешественников, заходивших под крышу старой гостиницы. Она держит
            трубку, словно созданную для того, чтобы ловить эхо прошлых веков.
            Её глаза блестят, будто она знает и прошлое, и то, что ждёт путника
            впереди Трубка в её лапках чуть дрожит, когда ветер касается её
            краешка — и кажется, что это не порыв воздуха, а шёпот дома, который
            продолжает доверять секреты лишь тем, кто умеет слушать. Ты
            чувствуешь: Зайчиха не случайно стоит именно здесь. Она —
            проводница. Хранительница звуков, историй и тайн. А значит…
            следующее слово в твоём путешествии будет принадлежать именно ей. Ты
            делаешь шаг ближе, и в этот миг будто что-то в воздухе меняется.
            Зайчиха Трубач слегка поворачивается к тебе — так едва заметно, что
            иной бы решил: показалось. Но ты знаешь, что здесь, среди мазайских
            хранителей, совпадений не бывает. Её лапка мягко касается края
            трубки, и из неё, словно выпавший из чужой эпохи свиток, медленно
            появляется маленькое письмо. Бумага тёплая, будто хранила в себе
            чужие голоса. Зайчиха протягивает его тебе — не словами, а взглядом,
            в котором читается: «Пора идти дальше»
          </p>

          <img src={step5Image} alt="Мазайский заяц" className="text-image" />

          <p className="text-paragraph">
            Зайчиха Трубач ещё мгновение стояла неподвижно, словно вслушиваясь в
            ветер между старых кирпичных стен. Потом она подняла свою тонкую
            серебристую трубу, коснулась её краешком к груди — жест уважения
            страннику — и произнесла тихо, но отчётливо, так, будто звук её слов
            прошёл прямо через твоё сердце: — Путник, ступай. Пусть город сам
            раскрывает перед тобой двери, что скрывал долгие годы. Мне же — час
            вернуться к своей песне. Она качнула головой, и лёгкий, почти
            неуловимый звон отразился под сводами старого особняка. В следующее
            мгновение её силуэт будто чуть потускнел, стал частью вечернего
            света — и снова застыл в камне. И ты, сжимая письмо, которое она
            вложила тебе в руку, обращаешь взгляд вперёд — туда, где ждёт
            следующий хранитель.
          </p>
        </TextBlock>
      )}
      {currentStep === 6 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step6"
          foundQuestPoints={foundQuestPoints}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from "react";
import TextBlock from "../components/TextBlock.jsx";
import RewardChoice from "../components/RewardChoice.jsx";
import MapCanvas from "../components/MapCanvas.jsx";
import topImage from "../assets/marshrut44.png";
import questImage from "../assets/quest-img.png";
import step2Image from "../assets/step-2.svg";
import step5Image from "../assets/step-5.svg";
import step7Image from "../assets/step-7.svg";
import step9Image from "../assets/step-9.svg";
import step11Image from "../assets/step-11.svg";
import step13Image from "../assets/step-13.svg";
import step15Image from "../assets/step-15.svg";
import step17Image from "../assets/step-17.svg";
import step19Image from "../assets/step-19.svg";
import step21Image from "../assets/step-21.svg";
import step23Image from "../assets/step-23.svg";
import step25Image from "../assets/step-25.svg";
import step27Image from "../assets/step-27.svg";
import step29Image from "../assets/step-29.svg";
import hint1Image from "../assets/hint-img-1.png";
import hint2Image from "../assets/hint-img-2.png";
import hint3Image from "../assets/hint-img-3.png";
import hint4Image from "../assets/hint-img-4.png";
import hint5Image from "../assets/hint-img-5.png";
import hint6Image from "../assets/hint-img-6.png";
import hint7Image from "../assets/hint-img-7.png";
import hint8Image from "../assets/hint-img-8.png";
import hint9Image from "../assets/hint-img-9.png";
import hint10Image from "../assets/hint-img-10.png";
import hint11Image from "../assets/hint-img-11.png";
import hint12Image from "../assets/hint-img-12.png";
import hint13Image from "../assets/hint-img-13.png";
import finishBg from "../assets/finish-bg.svg";

import startAudio from "../assets/audio/start.wav";
import hare1Audio from "../assets/audio/hare-1.wav";
import hare2Audio from "../assets/audio/hare-2.wav";
import hare3Audio from "../assets/audio/hare-3.wav";
import hare4Audio from "../assets/audio/hare-4.wav";
import hare5Audio from "../assets/audio/hare-5.wav";
import hare6Audio from "../assets/audio/hare-6.wav";
import hare7Audio from "../assets/audio/hare-7.wav";
import hare8Audio from "../assets/audio/hare-8.wav";
import hare9Audio from "../assets/audio/hare-9.wav";
import hare10Audio from "../assets/audio/hare-10.wav";
import hare11Audio from "../assets/audio/hare-11.wav";
import hare12Audio from "../assets/audio/hare-12.wav";
import hare13Audio from "../assets/audio/hare-13.wav";
import hare14Audio from "../assets/audio/hare-14.wav";

import "../styles/fonts.css";
import "/src/pages/QuestPage.css";

// Компонент для оптимизированного изображения с ленивой загрузкой
const OptimizedImage = ({ src, alt, className, priority = false }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority) {
      // Приоритетные изображения загружаем сразу
      setImageSrc(src);
    } else {
      // Остальные - через Intersection Observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.disconnect();
            }
          });
        },
        { rootMargin: "200px" }, // Начинаем загрузку за 200px до появления
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }
  }, [src, priority]);

  return (
    <div ref={imgRef} className={className} style={{ display: "inline-block" }}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.2s" }}
        />
      )}
    </div>
  );
};

export default function QuestPage() {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem("questStep");
    return saved ? Number(saved) : 0;
  });
  const [completedSteps, setCompletedSteps] = useState([]);
  const [foundQuestPoints, setFoundQuestPoints] = useState([]);
  const [selectedReward, setSelectedReward] = useState(() => {
    const saved = localStorage.getItem("selectedReward");
    return saved ? JSON.parse(saved) : null;
  });
  const mapRef = useRef(null);

  const stepAudioMap = {
    0: startAudio,
    1: hare1Audio,
    2: hare2Audio,
    3: hare3Audio,
    4: hare4Audio,
    5: hare5Audio,
    6: hare6Audio,
    7: hare7Audio,
    8: hare8Audio,
    9: hare9Audio,
    10: hare10Audio,
    11: hare11Audio,
    12: hare12Audio,
    13: hare13Audio,
    14: hare14Audio,
  };

  // Сохраняем выбранную награду в localStorage
  useEffect(() => {
    if (selectedReward) {
      localStorage.setItem("selectedReward", JSON.stringify(selectedReward));
    }
  }, [selectedReward]);

  // В useEffect где вызывается startQuest добавьте:
  useEffect(() => {
    if (!mapRef.current) return;
    const timer = setTimeout(() => {
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
        case 8:
          mapRef.current.startQuest("step8");
          break;
        case 10:
          mapRef.current.startQuest("step10");
          break;
        case 12:
          mapRef.current.startQuest("step12");
          break;
        case 14:
          mapRef.current.startQuest("step14");
          break;
        case 16:
          mapRef.current.startQuest("step16");
          break;
        case 18:
          mapRef.current.startQuest("step18");
          break;
        case 20:
          mapRef.current.startQuest("step20");
          break;
        case 22:
          mapRef.current.startQuest("step22");
          break;
        case 24:
          mapRef.current.startQuest("step24");
          break;
        case 26:
          mapRef.current.startQuest("step26");
          break;
        case 28:
          mapRef.current.startQuest("step28");
          break;
        case 30:
          mapRef.current.startQuest("step30");
          break;
        default:
          break;
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Сохраняем прогресс только если текущий шаг > 0
  useEffect(() => {
    if (currentStep > 0) {
      localStorage.setItem("questStep", currentStep);
    }
  }, [currentStep]);

  // Предзагрузка критических изображений для текущего шага
  useEffect(() => {
    const preloadImagesForStep = () => {
      const imagesToPreload = [];

      // Определяем какие изображения нужны для текущего шага
      switch (currentStep) {
        case 0:
          imagesToPreload.push(topImage, questImage);
          break;
        case 1:
        case 2:
        case 3:
          imagesToPreload.push(hint1Image, step2Image);
          break;
        case 4:
        case 5:
          imagesToPreload.push(hint2Image, step5Image);
          break;
        case 6:
        case 7:
          imagesToPreload.push(hint3Image, step7Image);
          break;
        case 8:
        case 9:
          imagesToPreload.push(hint4Image, step9Image);
          break;
        case 10:
        case 11:
          imagesToPreload.push(hint5Image, step11Image);
          break;
        case 12:
        case 13:
          imagesToPreload.push(hint6Image, step13Image);
          break;
        case 14:
        case 15:
          imagesToPreload.push(hint7Image, step15Image);
          break;
        case 16:
        case 17:
          imagesToPreload.push(hint8Image, step17Image);
          break;
        case 18:
        case 19:
          imagesToPreload.push(hint9Image, step19Image);
          break;
        case 20:
        case 21:
          imagesToPreload.push(hint10Image, step21Image);
          break;
        case 22:
        case 23:
          imagesToPreload.push(hint11Image, step23Image);
          break;
        case 24:
        case 25:
          imagesToPreload.push(hint12Image, step25Image);
          break;
        case 26:
        case 27:
          imagesToPreload.push(hint13Image, step27Image);
          break;
        case 28:
        case 29:
          imagesToPreload.push(step29Image);
          break;
        case 32:
        case 33:
          imagesToPreload.push(finishBg);
          break;
        default:
          break;
      }

      // Предзагружаем изображения
      imagesToPreload.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    preloadImagesForStep();
  }, [currentStep]);

  const handleStartJourney = () => {
    setCurrentStep(1); // начинаем квест с первого текстового шага
  };

  const handleNextStep = () => setCurrentStep((prev) => prev + 1);

  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      setCurrentStep(0);
    } else if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Слушаем событие от Header для кнопки "назад"
  useEffect(() => {
    const handleQuestBack = () => {
      handleBack();
    };

    window.addEventListener("questBack", handleQuestBack);

    return () => {
      window.removeEventListener("questBack", handleQuestBack);
    };
  }, [handleBack]);

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
      // Карта → Текст (нечетные шаги карта, четные - текст)
      // Шаг 2 (карта) → 3 (текст)
      // Шаг 4 (карта) → 5 (текст)
      // Шаг 6 (карта) → 7 (текст)
      // Шаг 8 (карта) → 9 (текст)
      // Шаг 10 (карта) → 11 (текст)
      // и т.д.

      // Простая логика: если это четный шаг (карта), переходим на следующий нечетный (текст)
      if (prev % 2 === 0 && stepNumber === prev) {
        return prev + 1;
      }

      // Для шагов, где есть особая логика (если нужно)
      if (prev === 2 && stepNumber === 2) return 3;
      if (prev === 4 && stepNumber === 4) return 5;
      if (prev === 6 && stepNumber === 6) return 7;
      if (prev === 8 && stepNumber === 8) return 9;
      if (prev === 10 && stepNumber === 10) return 11;
      if (prev === 12 && stepNumber === 12) return 13;
      if (prev === 14 && stepNumber === 14) return 15;
      if (prev === 16 && stepNumber === 16) return 17;
      if (prev === 18 && stepNumber === 18) return 19;
      if (prev === 20 && stepNumber === 20) return 21;
      if (prev === 22 && stepNumber === 22) return 23;
      if (prev === 24 && stepNumber === 24) return 25;
      if (prev === 26 && stepNumber === 26) return 27;
      if (prev === 28 && stepNumber === 28) return 29;
      if (prev === 30 && stepNumber === 30) return 31; // финальный шаг

      return prev;
    });
  };

  const handleRewardSelected = (reward) => {
    setSelectedReward(reward);
  };

  const step1Text = (
    <div className="text-content">
      <p className="text-paragraph">
        &emsp;Вступай, путник, в город, где прошлое не спит, а улицы шепчут о
        событиях, что случались века назад. Здесь, среди старых домов и
        набережных, спрятаны истории, которые не слышит большинство прохожих. Но
        для тех, кто умеет наблюдать, город открывает свои тайны. &emsp;Весной,
        когда Волга разливается и вода касается берегов, вспоминают Мазая —
        старика, который выходил на лодке и спасал зайцев с затопленных
        островов. История эта известна каждому, но её продолжение живёт в
        Костроме до сих пор. &emsp;Некоторые из спасённых зайцев остались в
        городе. Они превратились в хранителей — маленьких наблюдателей,
        внимательных и осторожных. Их называют мазайскими зайцами, и каждый из
        них словно хранит частицу древней тайны. &emsp;Они не раскрывают её
        сразу, но ведут за собой тех, кто способен видеть, слушать и замечать
        детали, на которые обычный взгляд не обратит внимания. Следуй за ними —
        через набережные, дворы и старые улицы. Каждый мазайский заяц — это
        намёк, загадка, след, который ведёт к большему. Тайна, которую они
        хранят, велика, и узнать её полностью можно лишь пройдя весь путь до
        конца. &emsp;Готов ли ты отправиться по следу хранителей, внимать их
        знакам и раскрыть секреты, которые город хранил веками?
      </p>
    </div>
  );

  return (
    <div className="app-container">
      {currentStep === 0 ? (
        // Стартовый экран квеста
        <>
          <div className="top-image-container">
            <OptimizedImage
              src={topImage}
              alt="Топ"
              className="top-image-container"
              priority={true}
            />
          </div>

          <div style={{ padding: "16px", textAlign: "center" }}>
            <button
              onClick={handleStartJourney}
              className="start-journey-button"
            >
              Начать путешествие
            </button>
          </div>

          <div className="quest-image-container">
            <OptimizedImage
              src={questImage}
              alt="Квест"
              className="quest-image-container"
              priority={true}
            />
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
              audioSrc={stepAudioMap[0]}
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
          hintImage={hint1Image}
          hintAddress="Проспект Мира, 4"
          stepNumber={3}
          audioSrc={stepAudioMap[1]}
        >
          <p className="text-paragraph">
            &emsp;Ты идёшь по проспекту Мира — старой, широкой улице, где дома
            словно хранят дыхание прошлых веков. Здесь, среди рядов старинных
            зданий, твой взгляд останавливается на небольшом существе: это
            Почтальон, первый из мазайских зайцев.
            <br />
            &emsp; Он стоит прямо на фасаде дома. На нём аккуратная шапочка,
            через плечо перекинут портфель, а рядом на стене висит маленький
            почтовый ящик. Его глаза блестят живым огоньком, и кажется, что он
            вот-вот двинется. И вдруг — словно ожив!
            <br />
            &emsp; — Почтальон шевельнул ушками и слегка наклонил голову, будто
            приглашая подойти ближе.
            <br />
            &emsp; С улицы слышен тихий шум, шаги прохожих, но Почтальон будто
            слышит что-то ещё — шёпот старых домов, звуки, которые знают только
            хранители тайн. Он приподнимает лапку и из портфеля достаёт
            маленький свёрток. Ветер слегка подхватывает его края, и Почтальон
            передаёт его тебе.
            <br />
            &emsp; Ты берёшь письмо и разворачиваешь его. На пергаменте
            красивым, аккуратным почерком написано:
          </p>

          <OptimizedImage
            src={step2Image}
            alt="Мазайский заяц"
            className="text-image"
          />

          <p className="text-paragraph">
            &emsp;Почтальон слегка подпрыгнул, будто одобряя твою
            внимательность, и снова замер на фасаде, неподвижный и тихий, как
            будто его магия вновь превратила его в статую. Но ты знаешь: письмо
            — первый ключ, первая подсказка, и именно оно укажет путь дальше.
            <br />
            &emsp; Проспект Мира больше не кажется обычной улицей. Каждый дом,
            каждый фасад, каждый фонарь и брусчатка теперь могут хранить тайны,
            и твой путь только начинается. Следуй за подсказкой, и мазайские
            хранители поведут тебя дальше.
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
          hintImage={hint2Image}
          hintAddress="Симановского, 4 "
          stepNumber={5}
          audioSrc={stepAudioMap[2]}
        >
          <p className="text-paragraph">
            &emsp;Перед тобой возвышается дом, что старше многих поколений
            костромичей. Его красный кирпич, строгие линии и величественный
            облик помнят больше, чем способны рассказать человеческие голоса.
            Здание это родилось в 1815 году — и с тех пор стоит на проспекте
            Мира, будто страж дороги, ведущей в сердце старой Костромы.
            <br />
            &emsp; Когда-то внутри этого дома кипела жизнь. В конце XIX века
            здесь располагалась знаменитая гостиница «Большая Московская». По
            вечерам из её ресторана лились мелодии — и не простые: играл первый
            и единственный в России женский духовой оркестр, удивлявший гостей
            города. В декабре 1904 года стены дома слышали речь Якова Свердлова,
            прозвучавшую здесь на торжественном вечере. После революции дом стал
            административным: здесь размещались губфинотдел, комитет комсомола,
            городские управления. Потом наступили долгие годы тишины — здание
            пустело и ветшало, словно заснувшее в своей собственной истории.
            <br />
            &emsp; Но в 2023 году дом вновь ожил: после большой реставрации
            внутри него открылся ресторан-сыроварня, и теперь его окна снова
            светятся, а жизнь течёт по этажам, как прежде — только иначе. <br />
            &emsp; И именно здесь, у фасада этого пережившего эпохи дома, стоит
            Зайчиха Трубач. Её маленькая фигурка будто впитала в себя все звуки,
            что когда-то звучали под этими стенами — от оркестровых мелодий до
            шагов путешественников, заходивших под крышу старой гостиницы.
            <br />
            &emsp; Она держит трубку, словно созданную для того, чтобы ловить
            эхо прошлых веков. Её глаза блестят, будто она знает и прошлое, и
            то, что ждёт путника впереди.
            <br />
            &emsp; Трубка в её лапках чуть дрожит, когда ветер касается её
            краешка — и кажется, что это не порыв воздуха, а шёпот дома, который
            продолжает доверять секреты лишь тем, кто умеет слушать. <br />
            &emsp; Ты чувствуешь: Зайчиха не случайно стоит именно здесь. Она —
            проводница. Хранительница звуков, историй и тайн. А значит…
            следующее слово в твоём путешествии будет принадлежать именно ей.
            <br />
            &emsp; Ты делаешь шаг ближе, и в этот миг будто что-то в воздухе
            меняется. Зайчиха Трубач слегка поворачивается к тебе — так едва
            заметно, что иной бы решил: показалось. Но ты знаешь, что здесь,
            среди мазайских хранителей, совпадений не бывает.
            <br />
            &emsp; Её лапка мягко касается края трубки, и из неё, словно
            выпавший из чужой эпохи свиток, медленно появляется маленькое
            письмо. Бумага тёплая, будто хранила в себе чужие голоса. Зайчиха
            протягивает его тебе — не словами, а взглядом, в котором читается:
            «Пора идти дальше»
          </p>

          <OptimizedImage
            src={step5Image}
            alt="Мазайский заяц"
            className="text-image"
          />

          <p className="text-paragraph">
            &emsp;Зайчиха Трубач ещё мгновение стояла неподвижно, словно
            вслушиваясь в ветер между старых кирпичных стен. Потом она подняла
            свою тонкую серебристую трубу, коснулась её краешком к груди — жест
            уважения страннику — и произнесла тихо, но отчётливо, так, будто
            звук её слов прошёл прямо через твоё сердце: <br />
            &emsp; — Путник, ступай. Пусть город сам раскрывает перед тобой
            двери, что скрывал долгие годы. Мне же — час вернуться к своей
            песне.
            <br />
            &emsp; Она качнула головой, и лёгкий, почти неуловимый звон
            отразился под сводами старого особняка. В следующее мгновение её
            силуэт будто чуть потускнел, стал частью вечернего света — и снова
            застыл в камне. <br />
            &emsp;И ты, сжимая письмо, которое она вложила тебе в руку,
            обращаешь взгляд вперёд — туда, где ждёт следующий хранитель.
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

      {currentStep === 7 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep} // или handleQuestPointReached(8)
          hintImage={hint3Image}
          hintAddress="ул. Мучные Ряды"
          stepNumber={7}
          audioSrc={stepAudioMap[3]}
        >
          <p className="text-paragraph">
            &emsp;Ты ступил на улицу Симановского и идёшь по её вымощенному
            тротуару, слушая шёпот старых домов. Впереди ты видишь скромное,
            двухэтажное здание — Дом жилой П.И.Ботникова, исторический дом, что
            стоит по адресу Симановского, 4. Это не вычурный особняк, а простое,
            но важное свидетельство костромской истории: кирпичный, с
            характерной для первой четверти XIX века архитектурой. <br />
            &emsp; Дом был заложен ещё в начале XIX века: К 1828-му здание было
            завершено. Позднее, в 1847 году, дом пострадал от пожара, но его
            восстановили, сохранив исторический облик. <br />
            &emsp; Этот город помнит огонь лучше многих своих жителей. <br />
            &emsp;В 1413 году Кострома выгорела почти полностью. После этого
            кремль пришлось перенести на новое место, чтобы защитить город от
            новых бед.
            <br />
            &emsp; В 1654 году пламя сожгло кремль вновь. А через 25 лет, в 1679
            году, огонь уничтожил большую часть нового города и посадов. <br />
            &emsp; Но огонь не унимался. В 1773 году Кострома почти полностью
            выгорела: всего лишь топящаяся баня превратилась в начальный очаг
            бедствия, а языки пламени быстро перекинулись на дома и лавки.
            <br />
            &emsp; Спустя всего несколько лет, в 1779 году, пожар опустошил
            более половины города. И снова, в 1847 году, огонь бушевал целую
            неделю: сгорело 188 домов, Богоявленский монастырь, три фабрики,
            четыре общественных здания — почти половина Костромы. Причиной
            пожара стали поджоги. <br />
            &emsp; Даже в конце XIX века, в 1887 году, пламя уничтожило северную
            часть города: 37 каменных, 24 полукаменных и 61 деревянное строение
            пало жертвой огня. <br />
            &emsp;И вот на этом фоне ты стоишь перед домом по улице
            Симановского, 4 — у стен которого стоит Заяц-Пожарный. Его блестящая
            каска и топор — не просто детали скульптуры. Он хранит память обо
            всех этих пожарах, обо всех домах и людях, что выстояли, и тех, кого
            огонь унёс.
            <br />
            &emsp; Когда ты подходишь ближе, Заяц чуть наклоняется, словно
            приглашая тебя прислушаться к истории: каждый всполох пламени в этих
            рассказах — урок мужества и заботы о городе. И теперь он протягивает
            тебе письмо — маленький свиток с новым заданием, как знак того, что
            твой путь продолжается.
          </p>

          <OptimizedImage
            src={step7Image}
            alt="Третий мазайский заяц"
            className="text-image"
          />

          <p className="text-paragraph">
            &emsp;Ты берёшь письмо, аккуратно переданное Зайцем-Пожарным. Его
            миниатюрные лапки отпускают свиток, а взгляд, хоть и каменный,
            словно следит за тобой, оценивает, готов ли ты идти дальше. На
            мгновение кажется, что время остановилось. Ветер тихо шелестит между
            тротуаром и фасадом дома, и в этом шёпоте слышится что-то вроде
            благодарности — за внимание, за терпение, за то, что ты смог
            выстоять перед испытанием огнём.
            <br />
            &emsp; Заяц слегка наклоняет голову — прощальный кивок. Его каска
            блеснула на солнце, штурмовой топорик едва позвенел, и всё вокруг
            словно подтвердило: он отпускает тебя в путь. Ты чувствуешь лёгкую
            дрожь воздуха, как будто сам город прощается с тобой через этого
            маленького хранителя. Он остаётся на месте, неподвижный и строгий,
            но с твоей стороны теперь открыта дорога к новой тайне — той, что
            хранит следующий мазайский заяц.
          </p>
        </TextBlock>
      )}
      {currentStep === 8 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step8" // Нужно добавить режим в MapCanvas
          foundQuestPoints={foundQuestPoints}
        />
      )}
      {currentStep === 9 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
          hintImage={hint4Image}
          hintAddress="Симановского, 4 "
          stepNumber={9}
          audioSrc={stepAudioMap[4]}
        >
          <p className="text-paragraph">
            &emsp;Ты держишь в руках письмо от Зайца-Пожарного и идёшь вдоль
            парка, пока твой взгляд не ловит Большие Мучные ряды — двухэтажный
            кирпичный комплекс с подвалами, образец раннего классицизма конца
            XVIII века. Эти ряды были построены в 1789 — 1790-х годах по проекту
            главного архитектора К. Клера, чтобы заменить деревянные лавки,
            сгоревшие в пожаре 1773 года. Стены их хранят шёпот купцов и шум
            торговли, а фасады с округлыми углами и двускатной крышей будто
            рассказывают о минувших веках.
            <br />
            &emsp; Ближе к концу рядов, вдоль парка, твой взгляд останавливается
            на маленькой фигурке, стоящей на чёрном витиеватом железном
            заборчике. Заяц‑Сыродел выглядит ожившим: на нём миниатюрный
            фартучок, в лапках — круглая головка сыра, которую он аккуратно
            удерживает. Его весёлый, хитрый взгляд словно говорит: «Я храню
            тайны этого места, слушай внимательно». <br />
            &emsp;Он чуть наклоняется, едва заметно подрагивают ушки, головка
            сыра слегка покачивается, как приветственный жест. Заяц бережно
            принимает письмо, которое ты несёшь от Зайца-Пожарного, внимательно
            его «читает» взглядом и одобрительно кивнул тебе, словно
            подтверждая, что ты готов идти дальше. Затем Заяц‑Сыродел вручает
            тебе новый свиток — письмо с подсказкой, которая поведёт к следующей
            тайне. Его маленький, но уверенный взгляд словно шепчет: «Следуй
            внимательно, путник. Истории Костромы ждут, чтобы их услышали.»
            <br />
            &emsp; Ветер мягко колышет листья деревьев вдоль парка, а старые
            ряды шепчут о купцах, торговле мукой и ремёслах, которые веками
            наполняли город жизнью.
          </p>

          <OptimizedImage
            src={step9Image}
            alt="Заяц-Часовой"
            className="text-image"
          />

          <p className="text-paragraph">
            &emsp;Ты держишь в руках письмо от Зайца-Сыродела. Он поднимает
            лапки с головкой сыра, слегка поворачивает её к тебе и с хитрой
            улыбкой будто говорит: «Смотри, что хранит мой труд… и будь
            внимателен, дальше ещё больше чудес». <br />
            &emsp;Ветер шевелит листья парка, и кажется, что сам аромат сыра,
            теплый и свежий, сопровождает твои шаги. Заяц-Сыродел не кланяется и
            не машет лапкой, он тихо остаётся на своём месте, наблюдая за тобой,
            как настоящий мастер за своей лавкой: спокойно, уверенно, с лёгким
            вызовом.
            <br />
            &emsp; Ты чувствуешь: встреча завершена. Но оставленная им тайна,
            письмо и намёки на следующую загадку — это как новый рецепт, который
            предстоит разгадать самому.
          </p>
        </TextBlock>
      )}
      {currentStep === 10 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step10"
          foundQuestPoints={foundQuestPoints}
        />
      )}
      {currentStep === 11 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
          hintImage={hint5Image}
          hintAddress="Улица Молочная гора"
          stepNumber={11}
          audioSrc={stepAudioMap[5]}
        >
          <p className="text-paragraph">
            &emsp;Перед тобой открывается широкая арка Гостиного двора. Стоит
            лишь переступить её порог, как пространство будто раскрывается — как
            если бы ты попал внутрь старинной коробочки с секретами. Красные
            ряды, кажущиеся снаружи небольшими и скромными, внутри оказываются
            похожи на целый маленький город. Одни здания сменяют другие, между
            ними тянутся аккуратные улочки, а под сводами эхом разносятся шаги и
            едва слышные шёпоты прошлого.
            <br />
            &emsp; В 20–30-е годы XIX века внутри этих рядов построили четыре
            одноэтажных корпуса — Мелочные ряды. Они будто вписались в общий
            ансамбль без единой лишней черты: невысокие, аккуратные, светлые.
            Когда-то здесь в изобилии продавали пуговицы и гребни, ленты,
            серьги, маленькие украшения — настоящие сокровища для модниц
            минувших времён. Мелочная торговля кипела, звон монет и голоса
            покупателей наполняли пространство, создавая неповторимый ритм
            старого торгового города.
            <br />
            &emsp; Ты идёшь по одной из внутренних «улиц», пока взгляд не
            останавливается на изящной фигурке, стоящей у кованой опоры рядом с
            дверью одной из лавок. Перед тобой — Зайчиха-Купчиха, и её бронзовый
            образ выглядит так, будто она вот-вот оживёт и пригласит тебя на
            неспешное чайное угощение.
            <br />
            &emsp; На Зайчихе — тяжёлое, богатое платье, выполненное с
            удивительной детализацией. На плечах — накидка с узорчатой фактурой,
            напоминающей теплые шали, которые когда-то продавали в лавках
            Мелочных рядов. Ты протягиваешь ей письмо от зайца Сыродела из
            Красных рядов. Она слегка склоняет голову — почти незаметно, но
            достаточно, чтобы понять: она его приняла. Её лапки, сложенные в
            традиционной купеческой позе, не спеша «прочитывают» свиток
            взглядом. Затем она ставит его рядом.
            <br />
            &emsp; Ты протягиваешь ей письмо от зайца Сыродела из Красных рядов.
            Она слегка склоняет голову — почти незаметно, но достаточно, чтобы
            понять: она его приняла. Её лапки, сложенные в традиционной
            купеческой позе, не спеша «прочитывают» свиток взглядом. Затем она
            ставит его рядом с самоваром и протягивает тебе новый — маленький,
            аккуратно свёрнутый, будто только что вынутый из резного сундучка.
            Её взгляд становится чуть мягче, наполняясь той самой купеческой
            мудростью, которой веками славилась Кострома. <br />
            &emsp;«Продолжай путь, путник, — словно шепчет бронзовая Купчиха. —
            Торговые ряды хранят много историй, и каждая хочет быть услышанной».
            Ты берёшь свиток и разварачивая чувствуешь, как ожившие торговые
            улочки Мелочных рядов провожают тебя дальше — к следующей тайне, к
            следующему зайцу, к новой странице древнего купеческого города.
          </p>

          <OptimizedImage
            src={step11Image}
            alt="Заяц-Часовой"
            className="text-image"
          />
        </TextBlock>
      )}
      {currentStep === 12 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step12"
          foundQuestPoints={foundQuestPoints}
        />
      )}
      {currentStep === 13 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
          hintImage={hint6Image}
          hintAddress="Не доходя до кафе Лесная улица, 2"
          stepNumber={13}
          audioSrc={stepAudioMap[6]}
        >
          <p className="text-paragraph">
            &emsp;Письмо от Зайчихи-Купчихи приводит тебя на Молочную Гору —
            место, где когда-то кипела особая, суровая и честная жизнь. Ты
            поднимаешься по улочке, и в воздухе будто слышится поскрипывание
            телег, гул людских разговоров и плеск воды у берега Волги. <br />
            &emsp;Здесь, у подножия Молочной Горы, вдоль старинной
            Екатеринославской площади, когда-то стояли обелиски Московской
            заставы — парадного въезда в Кострому, возведённого по проекту
            архитектора Петра Фурсова. Это было шумное, оживлённое место: суда
            приставали к берегу, грузчики трудились с раннего утра, купцы
            оформляли товар и платили пошлины. Склады, наваленные бревна, лодки,
            лавки — всё это создаёт ощущение городского сердца, которое билось
            здесь сотни лет назад. <br />
            &emsp;Молочная Гора получила своё название не случайно: жители
            заволжских деревень поднимались сюда со своим товаром — свежим
            молоком, творогом, маслом. Торговля шла прямо на склоне, среди
            простых заведений: дешёвые трактиры, чайные, казённый питейный дом и
            знаменитая чайная общества трезвости «Колпаки», где водку подавали в
            чайниках, чтобы никто лишний раз не хвастал своей «храбростью». Но
            среди всей этой шумной торговли можно было встретить самых
            колоритных персонажей — зимогоров. Так в Костроме называли людей,
            которые зимой уходили в город на заработки: колоть дрова, чистить
            снег, носить тяжести на пристани. Иногда этим словом называли и
            бездельников, но чаще — просто людей, вынужденных жить сезонной,
            трудной жизнью.
            <br />
            &emsp; Леонид Колгушкин писал о них живо и ярко: зимогор был почти
            всегда с небритым лицом, в фартуке из мешковины, зимой в лаптях, а
            летом — босиком. Он не побирался и редко воровал, а летом мог
            работать до изнеможения, ночуя прямо на берегу. Зимой же им и правда
            приходилось «горевать».
            <br />
            &emsp; Чтобы помочь таким людям, в 1890 году на средства купца
            Фёдора Чернова построили ночлежный дом на 250 человек — и он до сих
            пор стоит недалеко от Московской заставы, как напоминание о
            благотворительности и простоте костромского сердца. <br />
            &emsp;Ты идёшь вдоль лавочки у дома № 9 по улице Молочная Гора — и
            тут взгляд цепляется за маленькую бронзовую фигурку, будто уютно
            устроившуюся посреди прошедших эпох. <br />
            &emsp;Перед тобой — Заяц-Зимогор. <br />
            &emsp;Он лежит на лавочке совершенно беззаботно, словно отдыхает
            после долгого трудового дня или лениво наблюдает за жизнью вокруг.
            Его поза расслабленная: руки за головой, ноги вытянуты, одна босая
            лапа чуть свисает с лавки. Бронза точно передаёт усталую, но
            довольную улыбку — ту, что бывает у человека, который наконец нашёл
            минутку покоя. На нём что-то вроде простого, видавшего виды пальто,
            а рядом виднеется табличка, будто шутливая подпись к нему: он здесь,
            он отдыхает — и он никому ничем не обязан. Кажется, что если
            прислушаться, можно услышать его ленивое:
            <br />
            «Эх… вот это жизнь. Сейчас полежу — и снова за дело… когда-нибудь».
            <br />
            &emsp; Ты протягиваешь ему письмо. Зимогор не встаёт — только
            приоткрывает один глаз, медленно берёт свиток и так же медленно,
            будто лениво, «читает» его. Затем он ухмыляется и, не поднимаясь,
            вытягивает лапу к тебе, держа новый листок — новую подсказку.
          </p>

          <OptimizedImage
            src={step13Image}
            alt="Заяц-Часовой"
            className="text-image"
          />

          <p className="text-paragraph">
            Он кивает еле заметно:
            <br />
            «Никуда не торопись. Всё важное приходит вовремя».
            <br />
            Ты принимаешь письмо. Ветер с Волги шуршит листьями, где-то вдали
            гудит грузовое судно — и кажется, что сам старый город вздохнул
            рядом с тобой.
          </p>
        </TextBlock>
      )}
      {currentStep === 14 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step14"
          foundQuestPoints={foundQuestPoints}
        />
      )}
      {currentStep === 15 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
          hintImage={hint7Image}
          hintAddress="ул. Чайковского, 9"
          stepNumber={15}
          audioSrc={stepAudioMap[7]}
        >
          <p className="text-paragraph">
            &emsp;Следуя совету Зимогора, ты спускаешься к Волге. Воздух здесь
            иной — влажный, глубокий, будто наполненный речной памятью. На
            набережной всё звучит иначе: шум воды, гул ветра и редкие голоса
            прохожих складываются в неторопливую мелодию старого портового
            города.
            <br />
            &emsp; Впереди появляется бело-голубая громада дебаркадера — «Старая
            пристань», легендарный причал-домик, который помнит и купеческие
            времена, и кинематографическую славу. Построенный в 1927 году, он
            когда-то принимал баржи и пароходы, которые причаливали к Костроме
            так же часто, как к большому торговому центру. В купеческие годы
            таких пристаней было несколько, и каждая жила своей жизнью — шумной,
            пахнущей древесиной, рыбой и дорогой. В 2012 году этот дебаркадер
            вернулся на берег уже после реставрации — спасённый от ветхости,
            восстановленный благодаря неравнодушным людям. Теперь он — памятник
            архитектуры регионального значения и живая часть истории города.
            <br />
            &emsp; И, конечно, именно здесь, на этих досках и под этим небом,
            Эльдар Рязанов снимал сцены своего знаменитого фильма «Жестокий
            романс». Ты словно видишь, как по мосткам проходят актёры, как
            камера скользит вдоль воды, как лодки и волжские туманы становятся
            частью романтической картины. Улицы старой Костромы — всё это
            оживало в кадре. Но здесь, у воды, история ощущается особенно ясно.
            <br />
            &emsp; Поворачивая к перилам набережной, ты замечаешь маленькую
            бронзовую фигурку. Перед тобой стоит Заяц-Моряк — маленький
            бронзовый страж Волги. Он разместился на невысоком металлическом
            ограждении набережной, всего в полуметре от воды, словно специально
            выбрав точку, с которой удобнее всего смотреть вдаль по течению.
            <br />
            &emsp; На голове у него шапка-козырёк старого речного образца, какую
            носили волжские матросы и капитаны начала XX века.
            <br />
            &emsp; Одет он в аккуратную морскую форму — всё говорит о дисциплине
            и службе. На его шее висит маленький бинокль.
            <br />
            &emsp; А в лапах он держит карту: развёрнутую, будто только что
            изученную.
            <br />
            &emsp; Заяц-Моряк смотрит вдаль — туда, где Волга уходит за поворот,
            как будто наблюдает за движением неведомых кораблей или ждёт сигнал
            с другого берега. В его позе — решимость речного человека, который
            привык быть и наблюдателем, и проводником.
            <br />
            &emsp; Ты стоишь рядом с маленьким бронзовым Моряком, и ветер с
            Волги мягко треплет карту в его лапах. Заяц, не отрывая взгляда от
            реки, будто сверяется с её течением, с горизонтом, с чем-то, что
            знает только он.
            <br />
            &emsp; Затем он медленно поворачивает голову к тебе. Его козырёк
            чуть блестит на солнце, а бинокль на груди тихо звенит о форму.
            Моряк аккуратно сворачивает карту, прячет её под лапу и вытаскивает
            другой свиток — маленький, плотный, словно предназначенный для
            важных речных указов.
            <br />
            &emsp; Он протягивает записку тебе, слегка наклонившись вперёд, как
            капитан, дающий приказ матросу.
          </p>

          <OptimizedImage
            src={step15Image}
            alt="Заяц-Часовой"
            className="text-image"
          />

          <p className="text-paragraph">
            &emsp;Заяц-Моряк снова смотрит вдаль и, будто бы беззвучно, говорит:
            <br />
            «Твой путь продолжается по берегу. Следуй за течением — оно знает
            дорогу лучше любого капитана».
            <br />
            Ты берёшь записку, и она теплеет в руке, словно храня в себе новую
            подсказку. Волга шумит рядом, и кажется, что сам её голос
            подталкивает тебя сделать следующий шаг.
          </p>
        </TextBlock>
      )}
      {currentStep === 16 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step16"
          foundQuestPoints={foundQuestPoints}
        />
      )}
      {currentStep === 17 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
          hintImage={hint8Image}
          hintAddress="Горная ул., 3"
          stepNumber={17}
          audioSrc={stepAudioMap[8]}
        >
          <p className="text-paragraph">
            &emsp;Ты поднимаешься от реки, следуя старой привычке тех, кто знает
            город на ощупь. Вода остаётся где-то внизу, в лёгкой дымке, а перед
            тобой открывается улица, убегающая к холму, где зелень старинного
            бульвара сливается с небом.
            <br />
            У порога скромного, но со вкусом отделанного дома, где на витринах
            переливается мягкой белизной и цветом полевых трав то, что веками
            здесь считали почти драгоценностью, ты замедляешь шаг.
            <br />
            Здесь сама история задержалась взглянуть на прохожих. <br />В этом
            краю, говорят, ещё с тех пор, когда купцы мерили дороги верстами, а
            зимы стояли такие, что иней держался до апреля, научились из самого
            простого стебля — голубого, с тонким корнем, любящего влажные низины
            — делать полотно, которое не стыдно подарить царице. Волжские луга и
            здешние росы давали лён то невероятной длины и мягкости, что нигде
            больше не встречалось. Ткали его так, что через семь слоёв можно
            было разглядеть монету, а рубаха из него не холодила в зной и грела
            в непогоду.
            <br />
            Потому и повелось: сказать «Кострома» — значит прибавить шёпотом
            «лён». Здесь каждый стебелёк знают в лицо — от всхода до спелого
            колокольчика. Здесь не пряжа, а песня: белоснежная, льняная, с
            тонким шелестом, как степной ветер. И не зря в старых домах до сих
            пор хранят скатерти, вытканные ещё прабабушками — они не стареют, а
            только становятся мудрее.
            <br /> Вот почему, когда ты видишь в этих краях женщину в платье,
            что струится легко и свободно, или на окне — занавеску, вышитую
            крестом, — знай: она говорит на языке земли, которая веками кормила
            и одевала всю Россию. И имя этой земле — костромская. <br />
            Здесь стоит Зайчиха-благородная дама со своей дочерью. Они словно
            остановились на мгновение во время прогулки. Благородная дама одета
            в элегантный наряд начала XX века: длинное платье мягко ниспадает к
            земле, в лапке — зонтик, на голове — аккуратная шляпка. Рядом — её
            дочь-подросток, чуть ближе к краю площадки, с живым, внимательным
            взглядом. В их позах чувствуется спокойствие и достоинство людей,
            для которых прогулка — не спешка, а особый ритуал. <br />
            &emsp; По замыслу авторов, они направляются на променад в Городской
            парк — одно из самых любимых мест отдыха костромичей прошлого века.
            <br />
            Прямо напротив, через неширокую дорогу, начинается то место, которое
            для многих поколений было главной наградой за неторопливый подъём.
            <br />
            Туда ведут чугунные ворота, распахнутые как объятия. За ними — мир,
            где время течёт иначе: не по часам, а по тени от деревьев, по шороху
            гравия под подошвой, по кружеву теней от старых клёнов. Здесь воздух
            гуще, чем на улице, — настоянный на цветах, пыльце и долгих вечерах,
            когда оркестр играл в деревянной раковине, а дамы в белых перчатках
            поправляли вуалетки. Прямо здесь, за зелёной стеной парка, на
            высоком холме над Волгой, веками стояло сердце Костромы — её древний
            Кремль. <br />
            Его величавая колокольня была видна за десятки вёрст и служила
            маяком проплывающим судам. Он видел и грозного Ивана, при котором
            заложили первый каменный собор, и приезд императрицы Екатерины, для
            которой возвели Триумфальные ворота. Здесь хранилась Феодоровская
            икона — главная святыня и покровительница земли Костромской.
            <br /> Век минувший оказался жесток к нему: соборы, возвышавшиеся
            над городом пять столетий, были стёрты с лица земли в 1930-х. Но
            случилось чудо, о котором мечтали многие поколения костромичей: уже
            воссоздан Богоявленский собор, а теперь из небытия поднимается и
            древний Успенский. Вскоре Кремль вновь обретёт свой первозданный вид
            и станет символом возрождённой красоты на высоком волжском берегу.
            <br />
            &emsp;Пока ты любуешься просторами Костромы, благородная дама
            аккуратно разворачивает новый свиток, бережно складывает его и
            протягивает тебе — так, как передают не просто указание, а важное
            напутствие. В её жесте нет спешки, только уверенность и уважение к
            пути, который ты уже прошёл. <br />
            Ты принимаешь письмо, чувствуя, что следующая история уже ждёт тебя
            там, куда ведут аллеи парка.
          </p>

          <OptimizedImage
            src={step17Image}
            alt="Заяц-Часовой"
            className="text-image"
          />
        </TextBlock>
      )}
      {currentStep === 18 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step18"
          foundQuestPoints={foundQuestPoints}
        />
      )}
      {currentStep === 19 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
          hintImage={hint9Image}
          hintAddress="Советская ул., 15, Кострома"
          stepNumber={19}
          audioSrc={stepAudioMap[9]}
        >
          <p className="text-paragraph">
            &emsp;Ты пришел на улицу Горную — той, что в старину звали
            Богословской, по имени древнего храма на вершине. Здесь, на этой
            улице, дома помнят и аптекаря Гакена, и дядю самого Островского.
            <br /> А теперь — смотри. Перед тобой дом под номером три. <br />
            Вот что рассказывает о нём его седая история. <br />
            Это здание — не просто стены. Это памятник архитектуры регионального
            значения, и его история — это история костромского
            предпринимательства и аромат свежего хлеба. <br />
            Главный объём этого двухэтажного каменного дома был возведён около
            1907 года. Представь: начало XX века, город у Волги, и здесь, на
            тихой Горной улице, открывается своё дело. <br />
            &emsp;Дом принадлежал купцу или промышленнику Тарутину (или
            Тарунину), и здесь располагалась его пекарня. Это было не просто
            место выпечки хлеба, а, скорее всего, небольшая, но крепкая семейная
            мануфактура, чья продукция пахла на всю округу. <br />
            &emsp;Дела у Тарутина шли хорошо, и в начале 1910-х годов здание
            расширили, пристроив северное крыло в том же стиле. Тогда же
            появилась и красивая ограда с воротами, которая сохранилась до наших
            дней. <br />
            После революции здесь был уже советский хлебозавод. В 1990-е —
            частная пекарня, закусочная и магазин. <br />
            <br />
            Именно здесь, у входа в этот дом, ты встречаешь ту, кого тебе велели
            искать. Она стоит рядом с торговым павильоном — хрупкая, в строгом
            форменном платье начала прошлого века, с лёгким обручем в лапках. Её
            вернули на это место совсем недавно, в начале 2026 года, после
            реставрации, подарив ей более безопасный приют под защитой камер
            видеонаблюдения. <br />
            Поговаривают, что если улыбнуться этой юной зайчихе, она непременно
            принесёт удачу. И правда, глядя на неё, кажется, что время
            остановилось на мгновение — как на той старой фотографии, где
            ученицы чинно прогуливаются по тихой богословской улице. <br />
            Ты нашёл то, что искал. Теперь твой путь лежит дальше и зайчиха с
            радостью тебе поможет,бери следкющее письмо и идем дальше — куда
            укажет следующая история.
          </p>

          <OptimizedImage
            src={step19Image}
            alt="Заяц-Часовой"
            className="text-image"
          />
        </TextBlock>
      )}
      {currentStep === 20 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step20"
          foundQuestPoints={foundQuestPoints}
        />
      )}
      {currentStep === 21 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
          hintImage={hint10Image}
          hintAddress="Советская площадь"
          stepNumber={21}
          audioSrc={stepAudioMap[10]}
        >
          <p className="text-paragraph">
            &emsp;Вы перешли широкую дорогу и теперь идёте по главной улице
            старого города. Времени до темноты остаётся всё меньше, и на душе
            становится немного грустно, что день клонится к вечеру. Но именно
            здесь вам суждено было повстречать его — того, кто сам служит
            Вечеру. <br />
            Смотрите: в одной из старинных арок он застыл на своём посту. Он
            присел на плечо фонарного столба, в простом картузе и ссутулившись —
            настоящий труженик, каких в прежние времена было много. Это
            Заяц-Фонарщик, третий из знаменитой семьи Мазайских зайцев. Он не
            всегда стоял здесь: раньше его можно было найти на высоком столбе на
            проспекте Мира. Но время течёт, и его, как и всех мастеров своего
            дела, перевели в эти спокойные и укромные места — под сень арок на
            улице Советской. Вы заметили, как на его спине блестят мелкие капли?
            Говорят, его любят гладить в надежде, что в доме всегда будет светло
            и тепло.
            <br /> В те времена, когда наши бабушки ещё только учились в
            гимназиях, весь центр Костромы погружался во тьму с заходом солнца.
            Первые робкие огоньки появились лишь в середине XIX века. Это были
            шестигранные стеклянные камеры, которые заправляли скипидаром,
            отчего свет был тусклым и коптящим. Представьте себе: к 1886 году в
            городе насчитали 586 таких фонарей, и каждый из них нужно было
            зажечь руками. И вот тогда на улицы выходили они — быстроногие, с
            лёгкими лестницами на плече, а зимой — с санками, гружёными
            заправленными керосиновыми лампами. За один вечер один фонарщик
            успевал обойти до 50 столбов. Он отпирал замок, открывал дверцу,
            протирал копоть и вставлял новую горящую лампу, двигаясь от фонаря к
            фонарю, пока вся улица не загоралась дрожащими огоньками. Эти
            скромные работники трудились до глубокой ночи, освещая путь
            прохожим. И знаете, что самое удивительное? Эта профессия не канула
            в Лету насовсем. Совсем недавно в Костроме она возродилась в новом,
            волшебном образе. Теперь гиды-фонарщики с настоящими керосиновыми
            лампами водят гостей по вечернему городу, рассказывая старые легенды
            и зажигая в сердцах людей огонёк добра. <br />
            Тайны Советской улицы Пока вы смотрите на зайца-фонарщика, взгляните
            вокруг. Улица, на которой вы стоите, тоже хранит множество имён.
            Когда-то в самом начале XIV века здесь была Русина улица — по
            названию слободы, где селились выходцы из Галицко-Волынской Руси.
            Позже, после большого пожара 1773 года, её перестроили и назвали
            Марьинской — в честь супруги будущего императора Павла I, Марии
            Фёдоровны. И только в годы великих потрясений она стала Советской.
            Здесь, в доме №7, в начале XX века хранилась подпольная литература.
            А напротив вас — суровое здание старого почтамта, возведённое в 1934
            году в стиле конструктивизма на месте разрушенной церкви Ильи
            Пророка. Всё смешалось на этой главной улице: история торговли,
            революции и мирной жизни.
            <br /> Так что не спешите уходить. Посидите рядом с ним, пока есть
            свет. Потому что когда на город опустится ночь и зажгутся газовые
            рожки, именно фонарщик в своей старой кепке будет охранять ваш путь.
            <br />
            Ну что ж, путник, настал тот самый миг, когда свет в конце дня
            сливается с теплом человеческой души.
            <br /> Фонарщик, как и положено, не привык к долгим речам — куда
            привычнее ему звяканье лестницы да шелест заправленных ламп в санях.
            Но, натруженной лапкой сняв с плеча новенький керосин, он молча
            протянул тебе сложенный вчетверо листок. Это наказ, и тебе решать —
            зажечь в себе огонёк любопытства или забраться с головой под тёплую
            шаль воспоминаний.
          </p>

          <OptimizedImage
            src={step21Image}
            alt="Заяц-Часовой"
            className="text-image"
          />
        </TextBlock>
      )}
      {currentStep === 22 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step22"
          foundQuestPoints={foundQuestPoints}
        />
      )}
      {currentStep === 23 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
          hintImage={hint11Image}
          hintAddress="ул. Красные Ряды, 1, Кострома"
          stepNumber={23}
          audioSrc={stepAudioMap[11]}
        >
          <p className="text-paragraph">
            &emsp;Ты стоишь на Советской площади, там, где вода в фонтане
            взлетает к небу и рассыпается серебряной пылью. А вот и он — тот,
            кого ты ищешь.
            <br /> Заяц-чиновник стоит на гранитной тумбе, и его поза говорит
            сама за себя. Правая лапка поднята вверх, указательный палец
            выставлен строго вперёд — жест, который означает либо «Минуточку
            внимания!», либо «Извольте подождать, я ещё не закончил». Под левой
            мышкой зажат портфель или папка с бумагами — там, наверное, лежат
            прошения, резолюции и указы о благоустройстве фонарей и мостовых.
            <br />
            Говорят, если остановиться рядом и тихонько спросить у него: «Ваше
            благородие, как пройти к счастью?», он укажет пальцем туда, где
            начинается старая Кострома. Проверять, правда ли это, мы не советуем
            — вдруг запишет в просители и выдаст повестку.
            <br /> Пока ты разглядываешь нашего чиновника, оглянись вокруг. Эту
            площадь прежде называли Воскресенской — по церкви Воскресения
            Христова, что стояла здесь ещё при царе Михаиле Фёдоровиче. Рядом с
            ней высилась шатровая колокольня, которую было видно с Волги. В XIX
            веке площадь обстроили присутственными местами и гостиницами — тогда
            она стала центром деловой жизни города. Купцы заключали сделки,
            чиновники таскали папки (совсем как наш заяц), а по праздникам здесь
            гремели ярмарки. В 1918 году площадь переименовали в Советскую, а в
            1930-е церкви снесли. На их месте разбили сквер, где в 1950-х
            установили фонтан — тот самый, что поёт и сейчас. В 2003 году
            добавили бронзового Юрия Долгорукого, который сидит чуть поодаль и
            задумчиво смотрит на огни города. <br />
            Теперь здесь гуляют мамы с колясками, молодожёны бросают монетки в
            фонтан, а вечером зажигаются фонари. И наш заяц-чиновник следит за
            порядком: поднятая лапка застыла в вечном «подождите», папка надёжно
            прижата к боку. Ведь порядок — прежде всего. <br />
            Но он не только строг. Присмотрись: в его глазах прячется лукавство.
            И кажется, он уже приготовил для тебя письмо
          </p>

          <OptimizedImage
            src={step23Image}
            alt="Заяц-Часовой"
            className="text-image"
          />
        </TextBlock>
      )}
      {currentStep === 24 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step24"
          foundQuestPoints={foundQuestPoints}
        />
      )}
      {currentStep === 25 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
          hintImage={hint12Image}
          hintAddress="ул. Табачные Ряды, 1, Кострома"
          stepNumber={25}
          audioSrc={stepAudioMap[12]}
        >
          <p className="text-paragraph">
            &emsp;Вот как вы щли от чиновника прямо, туда, где каменные аркады
            смыкаются над головой и воздух становится тяжелее от столетий
            торговли. И вот вы стоите перед ними — перед теми, кто не носит
            чинов и не ведёт протоколов, кто создаёт красоту, которую можно
            надеть на палец. <br />
            Это жанровая скульптура «Заяц-ювелир». Она изображает двух зайцев,
            которые тянут канитель — тончайшую металлическую нить, из которой
            потом сплетается ажурное кружево фирменной костромской скани. <br />
            По легенде, секреты и традиции мастеров-серебряников здесь никогда
            не записывали в книги — их передавали из поколения в поколение, из
            лап в лапы, от отца к сыну. Вот и на этой миниатюре вы видите
            взрослого зайца — опытного мастера, и рядом с ним его молодого
            подмастерья. Старший, согнув спину в трудовой дуге, натягивает
            канитель. Младший замер, ловит каждое движение, впитывает ремесло,
            которому на этой земле не одно столетие.
            <br />
            Но почему именно ювелиры? И почему именно здесь, в Красных рядах?
            Отвечу по порядку. Костромская земля знает толк в драгоценностях с
            глубокой древности — самые старые из найденных здесь украшений
            датируют X веком. А в 1565–1568 годах в переписных книгах уже
            мелькают имена «костромских серебряников».
            <br /> Настоящий расцвет промысла пришёлся на XVII столетие, а в XIX
            веке главным ювелирным сердцем губернии стало село Красное-на-Волге.
            Мастера оттуда славились на всю Россию, я даже уверен, что вы знаете
            их, например, всемиизвестный бренд Соколов был создан именно в
            Красном. В их руках золото и серебро оживали: чеканка, гравировка,
            эмаль и, конечно, скань (или, по-заморскому, филигрань) — ажурный
            узор, сплетённый из тончайшей проволоки. Каждая модница в империи
            мечтала иметь украшение в этой технике. Говорят, в XIX веке
            костромские мастера делали до 11 миллионов украшений в год. А нынче
            — слушайте, какая цифра — на Костромскую область приходится 60
            процентов всех российских золотых и серебряных изделий. Каждое
            второе кольцо или серьги в стране — отсюда, с этой земли, где
            ремесло передаётся от отца к сыну, как он там, за работой. А вот и
            место, где вы стоите. Красные ряды — или, по-старинному, Гостиный
            двор. Этот замкнутый каменный прямоугольник с арочными галереями
            начали возводить ещё в 1791 году, после того как страшный пожар 1773
            года обратил в пепел деревянные лавки. Здесь торговали «красным»
            товаром — то есть дорогим, красивым: тканями, мехами, готовым
            платьем. <br />
            Проект создавал архитектор Степан Воротилов по чертежам Карла Клера,
            но не дожил до конца стройки — зодчий умер, и галереи достраивал уже
            уездный землемер. Внутри, во дворе, позже появились Мелочные ряды,
            где продавали всякую всячину — от галантереи до чебуреков. Комплекс
            получился одним из лучших памятников русского классицизма — строгий,
            величавый, на века. <br />
            Вот уже больше двухсот лет здесь, под этими аркадами, кипит жизнь.
            Только вместо купцов в сюртуках — сувенирные лавки да ювелирные
            салоны. И теперь над этой вечной торговой суетой застыли двое — отец
            и сын, бронзовые ювелиры, что хранят древнее ремесло и, говорят,
            исполняют желания. Смотрите, как они натягивают свою серебряную
            нить. Может, и для вас сплетут что-то доброе? <br />И Кострома с
            радостью вам поможет! У беседки Островского, распологается надпись
            Любовь и если вам удасться пролесть в букву О, то вы обязательно в
            скором времени встретите вашу вторую половинку, для полной
            уверености еще можно отыскать скульптупу Ювелир-кустарь, мужчина
            изображеный на этой скульптуре, проверяет колечко, вы же можете
            просунуть пальцик в украшение и загадать самое сокравенное любовное
            желвние. Гарантируем прекрасную историю, вечной любви!
            <br />
          </p>

          <OptimizedImage
            src={step25Image}
            alt="Заяц-Часовой"
            className="text-image"
          />
        </TextBlock>
      )}
      {currentStep === 26 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step26"
          foundQuestPoints={foundQuestPoints}
        />
      )}
      {currentStep === 27 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
          hintImage={hint13Image}
          hintAddress="ул. Пряничные Ряды, 1"
          stepNumber={27}
          audioSrc={stepAudioMap[13]}
        >
          <p className="text-paragraph">
            Его домом стала полукруглая ниша в южном фасаде .Табачных рядов. В
            этих каменных «экседрах», подчёркнутых строгой колоннадой, когда-то
            шла бойкая торговля. А теперь здесь, у входа в магазин одежды
            .FreedomTAG, поселился тот, кого уже прозвали самым стильным среди
            всех зайцев. И правда, глядя на этого ушастого мастера, понимаешь:
            он знает толк в добром сукне и модном крое. Появился он здесь не так
            давно, весной 2025 года, став одним из трёх новых персонажей на
            Заячьей тропе. Сначала его прятали в торговом зале, чтобы самые
            внимательные искатели получили приз, но теперь он обосновался на
            виду у всех, уютно устроившись под аркой Кострома издревле славилась
            своими ремесленниками: к середине XVI века их насчитывалось более
            600 человек. Но мастера по одежде всегда были на особом счету. Слово
            «портной» — исконно русское, оно произошло от древнего «порть», то
            есть «кусок ткани». <br />В XVII веке, во времена расцвета города,
            на посаде уже вовсю работали портные, шубники, сарафанники и даже
            чулочники. А к концу XIX века портняжное дело стало одним из восьми
            официальных городских цехов, объединявшим почти сотню мастеров:
            портных, белошвеек и скорняков. Обучиться этому мастерству было
            непросто. Нужно было три года проходить в учениках, три — в
            подмастерьях, чтобы потом получить право открыть собственную
            мастерскую. В них работа кипела с восьми утра до десяти вечера, а
            перед праздниками — и того дольше. И главным другом портного, после
            иглы и напёрстка, в середине XIX века стала швейная машинка
            «Зингер». В Костроме их продавали в знаменитом доме Жукова, что на
            Русиной улице, предлагая не только выбрать машинку из 400 сортов, но
            и бесплатно обучиться искусству шитья. Так что не проходи мимо.
            Остановись рядом с этой уютной фигуркой. А он, словно чувствуя, что
            ты задержался, приготовил для тебя послание. Оно, как и полагается у
            портного, сшито из самых тёплых слов.
          </p>

          <OptimizedImage
            src={step27Image}
            alt="Заяц-Часовой"
            className="text-image"
          />
        </TextBlock>
      )}
      {currentStep === 28 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step28"
          foundQuestPoints={foundQuestPoints}
        />
      )}
      {currentStep === 29 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
          stepNumber={29}
          audioSrc={stepAudioMap[14]}
        >
          <p className="text-paragraph">
            &emsp;Вы прощаетесь с заботливым портным, который остаётся штопать
            свои старые ткани, и делаете шаг под своды Пряничных рядов. Аромат
            здесь совсем иной — не металла и пыли, а чего-то сдобного, тёплого,
            едва уловимого, будто где-то совсем рядом открыли дверь в пекарню. И
            действительно — вы почти у цели. <br />
            Вот он, восьмой. Застыл у входа в уютное заведение с французским
            названием, но с чисто русской душой. Узнать его легко: это
            Заяц-трактирщик (иногда его добродушно величают Романовым или
            Бархатовым — по фамилиям самых знаменитых хозяев трактиров старой
            Костромы). На вид он сыт, доволен и, кажется, вот-вот поведёт усатой
            мордой, приглашая вас отведать щей да выпить чайку. Говорят, если
            угостить его… нет, не морковкой, а бумажной купюрой, то удача в
            делах обязательно придёт сама, а кошелёк никогда не будет пуст.
            <br /> Пока вы разглядываете бронзового сладкоежку, оглянитесь
            вокруг. Пряничные ряды — это не просто архитектурный ансамбль рубежа
            XVIII–XIX веков. Это кладовая русской гастрономии. Здесь испокон
            веков продавали не только знаменитые пряники, но и всё, что так
            любили к чаю: сдобные калачи, хрустящие сушки, баранки, леденцы и
            прочие сладости. <br />В дореволюционной Костроме трактиры были не
            местом быстрого перекуса, а центром общественной жизни. Здесь купцы,
            затянутые в сюртуки, заключали сделки на десятки тысяч рублей,
            пускали дым из трубок и обсуждали последние городские новости.
            Бытовало даже просто: сказать извозчику не «вези в трактир на
            Московской», а «вези к Романову» — и каждый знал, о каком заведении
            идёт речь. Славилась губерния и своими особыми кушаньями. Писатель
            Алексей Ремизов восхищался трактиром купца Бархатова, где подавали
            «огурцы укропистые и мерные, какого-то необыкновенного засола, и
            ядренистую белую капусту-зайчика».
          </p>

          <OptimizedImage
            src={step29Image}
            alt="Заяц-Часовой"
            className="text-image"
          />
        </TextBlock>
      )}
      {currentStep === 30 && (
        <MapCanvas
          ref={mapRef}
          onBack={handleBack}
          onQuestPointReached={handleQuestPointReached}
          mode="step30"
          foundQuestPoints={foundQuestPoints}
        />
      )}
      {currentStep === 31 && (
        <TextBlock
          showTitle={false}
          showBackButton={true}
          onBack={handleBack}
          onNextStep={handleNextStep}
          stepNumber={31}
        >
          <p className="text-paragraph">
            Ты держишь в руках письмо последнего зайца, и перед глазами словно
            раскрывается вся Кострома, которую ты прошёл шаг за шагом. Каждый
            Заяц был ключом к тайнам города: один показывал уголки юности и
            мечтаний, другой — свет и тишину фонарных улиц, третий — труд и
            мастерство людей, строивших этот город. Теперь складывается целая
            картина: улицы, площади, арки, беседки и ряды — всё это не просто
            камень и дерево, а живые страницы истории. И чем больше ты узнаёшь о
            прошлом Костромы, тем яснее понимаешь её настоящее, её характер, её
            сердце. Город раскрывается перед тобой как книга, где каждая деталь
            важна. Здесь живут воспоминания и мечты, труд и радость, тайны и
            открытия. И в этом знании скрыт его настоящий ключ: любовь к
            Костроме рождается не только из красоты улиц, а из того, что ты
            начинаешь видеть её душу, понимаешь её историю и ощущаешь
            причастность к её непрерывному пути сквозь века. И теперь ты — часть
            этой истории, и город открыл тебе свои тайны.
          </p>
        </TextBlock>
      )}
      {currentStep === 32 && (
        <div
          className="finish-step-container"
          style={{
            backgroundImage: `url(${finishBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="finish-content">
            <p className="text-paragraph__title" style={{ color: "black" }}>
              Поздравляем!
            </p>
            <p className="text-paragraph__end" style={{ color: "black" }}>
              Ты успешно прошёл квест «Мазайские зайцы» и стал настоящим
              исследователем Костромы. Но приключения на этом не заканчиваются —
              город полон новых историй и секретов, готовых к открытию.
            </p>

            {/* Кнопка "Забрать награду" */}
            <div className="reward-button-container">
              <button className="reward-button" onClick={handleNextStep}>
                Забрать награду
              </button>
            </div>
          </div>
        </div>
      )}
      {currentStep === 33 && (
        <div className="congratulations-container">
          {/* Красный фон с повторяющимся текстом */}
          <div className="congratulations-bg">
            <div className="congratulations-text-track">
              {/* Первая половина (видимая) */}
              {Array.from({ length: 15 }).map((_, index) => (
                <div key={`top-${index}`} className="congratulations-text">
                  Поздравляем!
                </div>
              ))}
              {/* Вторая половина (для бесшовного повтора) */}
              {Array.from({ length: 15 }).map((_, index) => (
                <div key={`bottom-${index}`} className="congratulations-text">
                  Поздравляем!
                </div>
              ))}
            </div>
          </div>

          {/* Блок с наградой поверх */}
          <div className="reward-overlay">
            <RewardChoice
              onRewardSelected={handleRewardSelected}
              selectedRewardId={selectedReward?.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}

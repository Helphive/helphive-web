import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import "./step1.css";

gsap.registerPlugin(ScrollTrigger);

const Step1Content = ({
  onNext,
  services,
  selectedService,
  setSelectedService,
  rate,
  setRate,
  disableNext,
}) => {
  const handleServiceSelect = (id) => {
    setSelectedService(selectedService === id ? null : id);
    sessionStorage.setItem(
      "selectedService",
      JSON.stringify(selectedService === id ? null : id)
    );
  };

  const handleRateIncrease = () => {
    const currentRate = parseInt(rate, 10) || 0;
    if (currentRate < 200) {
      setRate((currentRate + 1).toString());
    }
  };

  const handleRateDecrease = () => {
    const currentRate = parseInt(rate, 10) || 0;
    if (currentRate > 20) {
      setRate((currentRate - 1).toString());
    }
  };

  useEffect(() => {
    gsap.fromTo(
      ".serviceCardsContainer",
      {
        opacity: 0,
        y: 100,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: ".serviceCardsContainer",
          start: "top 80%",
          end: "bottom 30%",
        },
      }
    );

    gsap.utils.toArray(".service").forEach((service) => {
      gsap.fromTo(
        service,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: service,
            start: "top 80%",
            end: "bottom 30%",
          },
        }
      );
    });
  }, []);

  return (
    <div id="serviceContainer" className="serviceCardsContainer">
      <h1>Services Available</h1>
      <p>Select the service you want</p>
      <div>
        {services.map((service, index) => (
          <div
            key={index}
            className={`service ${
              selectedService === service.id ? "s1-selectedService" : ""
            }`}
            onClick={() => handleServiceSelect(service.id)}
          >
            <img src={service.image} alt="" />
            <h4>{service.name}</h4>
            <p>{service.description}</p>
            <h5 className="price">{service.averageRate}</h5>
          </div>
        ))}
      </div>
      <h5 className="pricePrompt">Select Your Price To Deal</h5>
      <div className="selectPrice">
        <div
          className="min"
          onClick={handleRateDecrease}
          disabled={parseInt(rate, 10) <= 20}
        >
          <FaMinus />
        </div>

        <div className="dealPrice">
          <p>$</p>
          <p>{rate}</p>
        </div>
        <div
          className="max"
          onClick={handleRateIncrease}
          disabled={parseInt(rate, 10) >= 200}
        >
          <FaPlus />
        </div>
      </div>
      <div className="stepButtons">
        {/* <button onClick={onNext} disabled={disableNext}>
          Next
        </button> */}
      </div>
    </div>
  );
};

export default Step1Content;

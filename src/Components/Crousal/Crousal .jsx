// Carousel.jsx
import React, { useState } from "react";
import "./Crousal.css";

const Carousel = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="carousel">
      <button className="carousel-btn prev" onClick={goToPrev}>
        ❮
      </button>
      <div
        className="carousel-slides"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <div
            className="carousel-slide"
            key={index}
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          >
            <div className="carousel-caption">{slide.caption}</div>
          </div>
        ))}
      </div>
      <button className="carousel-btn next" onClick={goToNext}>
        ❯
      </button>
    </div>
  );
};

export default Carousel;

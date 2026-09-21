document.addEventListener('DOMContentLoaded', () => {
    // CARRUSEL DE PROMOCIONES
    const track = document.querySelector('.carousel-track');
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    
    // Si no estamos en la página del carrusel, detenemos el script aquí
    if(!track || !nextButton || !prevButton) return;

    const slides = Array.from(track.children);
    let currentIndex = 0;
    let autoPlayInterval;

    const updateCarousel = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
    };

    const moveToNextSlide = () => {
        currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
        updateCarousel(currentIndex);
    };

    const moveToPrevSlide = () => {
        currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
        updateCarousel(currentIndex);
    };

    nextButton.addEventListener('click', () => {
        moveToNextSlide();
        resetAutoPlay();
    });

    prevButton.addEventListener('click', () => {
        moveToPrevSlide();
        resetAutoPlay();
    });

    const startAutoPlay = () => {
        autoPlayInterval = setInterval(moveToNextSlide, 4000);
    };

    const resetAutoPlay = () => {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    };

    startAutoPlay();
});
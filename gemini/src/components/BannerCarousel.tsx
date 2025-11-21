import React, { useState, useEffect, useRef, useCallback } from 'react';
import lottie from 'lottie-web'; // Assuming lottie-web is installed and imported

export const BannerCarousel = ({ setView }: { setView: (view: string) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<HTMLDivElement[]>([]);
  const paginationContainerRef = useRef<HTMLDivElement>(null);
  const progressFillsRef = useRef<HTMLDivElement[]>([]);
  const carouselIntervalRef = useRef<number | null>(null);
  const loadedAnimationsRef = useRef<any[]>([]);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startTranslateRef = useRef(0);
  const currentTranslateRef = useRef(0);

  const DURATION = 7000;
  const animationPaths = [
    './banner_receitas.json',
    './banner2.json',
    './banner3.json',
    './banner4.json'
  ];
  const slidesCount = animationPaths.length;

  // Helper to get slide width
  const getSlideWidth = useCallback(() => {
    if (slideRefs.current[0]) {
      return slideRefs.current[0].offsetWidth;
    }
    return 0;
  }, []);

  // --- Timer Management ---
  const stopCarouselTimer = useCallback(() => {
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
      carouselIntervalRef.current = null;
    }
  }, []);

  const startCarouselTimer = useCallback(() => {
    stopCarouselTimer();
    carouselIntervalRef.current = window.setInterval(() => {
      setCurrentIndex(prev => ((prev + 1) % slidesCount));
    }, DURATION);
  }, [DURATION, slidesCount, stopCarouselTimer]);

  const restartCarouselTimer = useCallback(() => {
    startCarouselTimer();
  }, [startCarouselTimer]);


  // --- Pagination UI Update ---
  const updatePaginationUI = useCallback(() => {
    progressFillsRef.current.forEach((fill, i) => {
      if (!fill) return;

      // Reset all fills
      fill.style.transition = 'none';
      fill.style.width = '0%';
      fill.style.removeProperty('width');

      if (i === currentIndex) {
        // For the current slide, animate the fill
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (fill) { // Check if fill still exists
              fill.style.transition = `width ${DURATION}ms linear`;
              fill.offsetHeight; // Force reflow
              fill.style.width = '100%';
            }
          });
        });
      }
    });
  }, [currentIndex, DURATION]);


  // --- Core Slide Navigation Logic ---
  const goToSlide = useCallback((index: number, withAnimation = true) => {
    if (!trackRef.current || !slideRefs.current[0]) return;

    const newIndex = ((index % slidesCount) + slidesCount) % slidesCount;
    setCurrentIndex(newIndex); // This will trigger the effect that updates transform, pagination, lottie

    // Apply immediate transform if no animation (e.g., resize)
    if (!withAnimation) {
      const slideWidth = getSlideWidth();
      if (trackRef.current) {
        trackRef.current.style.transition = 'none'; // Temporarily disable transition
        trackRef.current.style.transform = `translateX(-${newIndex * slideWidth}px)`;
        trackRef.current.offsetHeight; // Force reflow
        trackRef.current.style.transition = ''; // Re-enable transition
      }
    }

    // Control Lottie animations directly
    loadedAnimationsRef.current.forEach((anim, i) => {
      if (anim) {
        if (i === newIndex) {
          anim.play();
        } else {
          anim.stop();
        }
      }
    });

  }, [slidesCount, getSlideWidth]);


  // --- useEffects for UI updates and lifecycle ---

  // Effect to apply transform when currentIndex changes (for smooth transitions)
  useEffect(() => {
    if (!trackRef.current || !slideRefs.current[0] || slidesCount === 0) return;
    const slideWidth = getSlideWidth();
    trackRef.current.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }, [currentIndex, getSlideWidth, slidesCount]);

  // Effect for pagination updates when currentIndex changes
  useEffect(() => {
    if (slidesCount <= 1) return;
    updatePaginationUI();
  }, [currentIndex, slidesCount, updatePaginationUI]);

  // Effect for setting up automatic carousel timer on mount and cleanup
  useEffect(() => {
    if (slidesCount <= 1) {
        stopCarouselTimer();
        return;
    }
    startCarouselTimer();
    return () => stopCarouselTimer();
  }, [slidesCount, startCarouselTimer, stopCarouselTimer]);


  // =========================================================================
  //         SWIPE SYSTEM
  // =========================================================================

  const getPositionX = useCallback((e: MouseEvent | TouchEvent) => {
    return (e as MouseEvent).pageX || (e as TouchEvent).touches[0].clientX;
  }, []);

  const handleStart = useCallback((e: MouseEvent | TouchEvent) => {
    if (!trackRef.current || !carouselRef.current || slidesCount <= 1) return;

    isDraggingRef.current = true;
    startXRef.current = getPositionX(e);
    stopCarouselTimer();

    carouselRef.current.classList.add('is-dragging');
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // Get current transform for smooth drag start
    const transformMatrix = new WebKitCSSMatrix(window.getComputedStyle(trackRef.current).transform);
    startTranslateRef.current = transformMatrix.m41;
    currentTranslateRef.current = startTranslateRef.current;
    trackRef.current.style.transition = 'none'; // Disable smooth transition during drag
  }, [getPositionX, stopCarouselTimer, slidesCount]);

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !trackRef.current || !slideRefs.current[0]) return;

    e.preventDefault();

    const currentX = getPositionX(e);
    const diffX = currentX - startXRef.current;
    let newTranslate = startTranslateRef.current + diffX;

    const slideWidth = getSlideWidth();
    const minTranslate = -(slidesCount - 1) * slideWidth;
    const maxTranslate = 0;

    // Boundary checks for swipe
    if (currentIndex === 0 && newTranslate > maxTranslate) {
      newTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.2; // Soft boundary for first slide
    } else if (currentIndex === slidesCount - 1 && newTranslate < minTranslate) {
      newTranslate = minTranslate + (newTranslate - minTranslate) * 0.2; // Soft boundary for last slide
    }

    currentTranslateRef.current = newTranslate;
    trackRef.current.style.transform = `translateX(${currentTranslateRef.current}px)`;
  }, [currentIndex, slidesCount, getSlideWidth, getPositionX]);

  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current || !carouselRef.current || !trackRef.current || !slideRefs.current[0] || slidesCount <= 1) return;

    isDraggingRef.current = false;
    carouselRef.current.classList.remove('is-dragging');
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    trackRef.current.style.transition = ''; // Re-enable smooth transition

    const movedBy = currentTranslateRef.current - startTranslateRef.current;
    const threshold = getSlideWidth() * 0.2;

    if (movedBy < -threshold) {
      goToSlide(currentIndex + 1);
    } else if (movedBy > threshold) {
      goToSlide(currentIndex - 1);
    } else {
      goToSlide(currentIndex); // Return to current slide if not enough drag
    }
    restartCarouselTimer(); // Restart auto-advance timer
  }, [currentIndex, getSlideWidth, goToSlide, restartCarouselTimer, slidesCount]);


  // Effect for adding and cleaning up event listeners for swipe and resize
  useEffect(() => {
    const carouselElement = carouselRef.current;
    if (!carouselElement) return;

    carouselElement.addEventListener('mousedown', handleStart);
    carouselElement.addEventListener('mousemove', handleMove);
    carouselElement.addEventListener('mouseup', handleEnd);
    carouselElement.addEventListener('mouseleave', handleEnd);

    carouselElement.addEventListener('touchstart', handleStart, { passive: false });
    carouselElement.addEventListener('touchmove', handleMove, { passive: false });
    carouselElement.addEventListener('touchend', handleEnd, { passive: false });

    const handleResize = () => goToSlide(currentIndex, false); // No animation on resize
    window.addEventListener('resize', handleResize);

    return () => {
      carouselElement.removeEventListener('mousedown', handleStart);
      carouselElement.removeEventListener('mousemove', handleMove);
      carouselElement.removeEventListener('mouseup', handleEnd);
      carouselElement.removeEventListener('mouseleave', handleEnd);

      carouselElement.removeEventListener('touchstart', handleStart);
      carouselElement.removeEventListener('touchmove', handleMove);
      carouselElement.removeEventListener('touchend', handleEnd);

      window.removeEventListener('resize', handleResize);
    };
  }, [handleStart, handleMove, handleEnd, goToSlide, currentIndex]);


  // Effect for loading Lottie animations
  useEffect(() => {
    if (typeof lottie === 'undefined') {
        console.error('[Banner Carousel] Lottie library not loaded!');
        // TODO: Handle Lottie not loaded, maybe show static image or error message
        return;
    }

    if (slidesCount === 0) return;

    const currentAnimations = loadedAnimationsRef.current; // Store reference to current array
    currentAnimations.forEach(anim => anim && anim.destroy()); // Destroy any existing animations
    loadedAnimationsRef.current = []; // Clear the ref array

    // If only one slide, handle it without carousel logic
    if (slidesCount === 1 && slideRefs.current[0]) {
      const container = slideRefs.current[0].querySelector('.lottie-animation-container');
      if (container) {
        const anim = lottie.loadAnimation({
          container: container as HTMLElement,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: animationPaths[0]
        });
        loadedAnimationsRef.current[0] = anim; // Store it
        anim.play(); // Ensure it plays
      }
      return;
    }

    // For multiple slides, load all but only play the current one
    animationPaths.forEach((path, index) => {
      const slide = slideRefs.current[index];
      if (!slide) return;
      const container = slide.querySelector('.lottie-animation-container');
      if (!container) {
        console.warn(`[Banner Carousel] Container not found for slide ${index}`);
        return;
      }

      const anim = lottie.loadAnimation({
        container: container as HTMLElement,
        renderer: 'svg',
        loop: true,
        autoplay: (index === currentIndex), // Autoplay only for the initial current slide
        path: path
      });

      loadedAnimationsRef.current[index] = anim; // Store it immediately
      
      anim.addEventListener('DOMLoaded', () => {
        // After DOM loaded, if it's the current slide, ensure it plays
        if (index === currentIndex) {
          anim.play();
        } else {
            anim.stop();
        }
      });
      
      anim.addEventListener('data_failed', () => {
        console.error(`[Banner Carousel] Failed to load animation ${index}`);
      });
    });

    // Cleanup Lottie animations on unmount
    return () => {
      loadedAnimationsRef.current.forEach(anim => {
        if (anim) anim.destroy();
      });
      loadedAnimationsRef.current = [];
    };
  }, [animationPaths, slidesCount, currentIndex]); // Rerun if paths, count, or current index changes

  // Initial setup for pagination DOM and styling
  useEffect(() => {
    if (slidesCount <= 1) {
        if (paginationContainerRef.current) {
            paginationContainerRef.current.innerHTML = '';
        }
        progressFillsRef.current = [];
        return;
    }

    if (paginationContainerRef.current) {
        paginationContainerRef.current.innerHTML = ''; // Clear previous pagination
        progressFillsRef.current = []; // Clear ref array
        for (let i = 0; i < slidesCount; i++) {
            const item = document.createElement('div');
            item.className = 'pagination-item w-1/4 h-1.5 bg-gray-300 rounded-full cursor-pointer overflow-hidden';
            item.onclick = () => {
                stopCarouselTimer();
                goToSlide(i, true); // Go to clicked slide, with animation
                restartCarouselTimer();
            };

            const fill = document.createElement('div');
            fill.className = 'pagination-fill h-full bg-blue-500 rounded-full';
            fill.style.width = '0%';
            fill.style.transition = 'none';
            item.appendChild(fill);
            paginationContainerRef.current.appendChild(item);
            progressFillsRef.current.push(fill);
        }
    }

    // Force reset bars immediately
    const forceResetBars = () => {
        progressFillsRef.current.forEach(fill => {
            if (fill) {
                fill.style.transition = 'none';
                fill.style.width = '0%';
                fill.style.setProperty('width', '0%', 'important');
                fill.offsetHeight; // Force reflow
            }
        });
    };

    // Ensure initial state is 0% width for all progress bars
    requestAnimationFrame(() => {
        forceResetBars();
        requestAnimationFrame(() => {
            forceResetBars(); // Double RAF for robust reset before starting animations
            // No need to call goToSlide(0) here, as current index is already 0.
            // The timer effect will start and trigger the first animation.
        });
    });
  }, [slidesCount, goToSlide, stopCarouselTimer, restartCarouselTimer]);


  // Handle click on carousel for navigation (dataset.link)
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (slidesCount <= 1) { // If only one slide, still allow its navigation
        const link = slideRefs.current[currentIndex]?.dataset.link;
        if (link && link !== '#') {
            setView(link);
        }
        return;
    }

    // Prevent click if user just dragged
    const movedBy = Math.abs(currentTranslateRef.current - startTranslateRef.current);
    if (isDraggingRef.current || movedBy > 10) return; // 10px threshold for drag

    // Get the data-link from the current slide
    const link = slideRefs.current[currentIndex]?.dataset.link;
    if (link && link !== '#') {
      setView(link); // Use the setView prop for navigation
    }
  }, [currentIndex, setView, slidesCount]);


  if (slidesCount === 0) {
    return null;
  }

  // Render slides dynamically
  const renderSlides = () => {
    return animationPaths.map((path, index) => (
      <div
        key={index}
        ref={el => { if (el) slideRefs.current[index] = el; }}
        className="lottie-slide flex-shrink-0 w-full h-full"
        // Example data-link. This should be derived from your actual data source.
        // For demonstration, mapping based on path name.
        data-link={path.includes('receitas') ? 'ReceitasPage' : `DetalheBanner${index + 1}`}
      >
        <div className="lottie-animation-container w-full h-full"></div>
      </div>
    ));
  };


  return (
    <div
      ref={carouselRef}
      className="main-carousel relative w-full h-96 overflow-hidden select-none touch-pan-y"
      onClick={handleClick}
    >
      <div
        ref={trackRef}
        className="carousel-track flex h-full transition-transform duration-500 ease-in-out"
      >
        {renderSlides()}
      </div>

      {slidesCount > 1 && (
        <div ref={paginationContainerRef} className="pagination-container absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {/* Pagination items rendered dynamically in useEffect */}
        </div>
      )}
    </div>
  );
};
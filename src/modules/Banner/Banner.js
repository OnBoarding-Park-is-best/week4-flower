import {
  NAV_BTN_COLOR,
  MORE,
  BANNER_TITLE,
  BANNER_LIST,
} from '../../constants/bannerData';
import { changeToNumber } from '../../utils/string';
import styles from './Banner.module.css';

export default function Banner({ $target }) {
  const $banner = document.createElement('section');
  $banner.className = styles.banner;
  $banner.classList.add(
    'container-fluid',
    'p-0',
    'justify-content-center',
    'align-items-center',
  );
  $target.appendChild($banner);

  const setBannerItem = (list) => {
    return `
      ${list
        .map(
          ({ TITLE, TEXT, BUTTON, IMG_MOBILE, IMG_PC }) => `
        <div class="${styles.bannerItem} slide">
          <div class="w-100 h-100 d-inline-block">
            <a href="#" class="${styles.bannerLink} w-100 h-100 d-block position-relative">
              <img class="${styles.bannerImg} w-100 h-100 position-absolute" src="${IMG_PC}" />
              <span class="${styles.bannerRealImgMobile} w-100 h-100 position-absolute" style="background-image: url(${IMG_MOBILE})"></span>
              <span class="${styles.bannerRealImgPC} w-100 h-100 position-absolute" style="background-image: url(${IMG_PC})"></span>
              <div class="${styles.bannerPhrase} d-flex w-100 h-100 justify-content-center align-items-center">
                <strong class=${styles.bannerTitle}>${TITLE}</strong>
                <p class=${styles.bannerText}>${TEXT}</p>
                <button class="${styles.bannerButton} btn btn-outline-dark">${BUTTON}</button>
              </div>
            </a>
          </div>
        </div>
      `,
        )
        .join('')}
    `;
  };

  this.render = () => {
    const bannerItem = setBannerItem(BANNER_LIST);
    $banner.innerHTML = `
      <div class="${styles.container} w-100 m-0">
        <div class="${styles.header} w-100">
          <h3 class="${styles.title} m-0 p-0">${BANNER_TITLE}</h3>
        </div>
        <div id="carousel" class="${styles.carousel} w-100 m-0 d-block position-relative">
          <div class="${styles.slider} w-100 h-100 m-0">
            <div id="track" class="${styles.track}">
              ${bannerItem}
            </div>
          </div>
          <a class=${styles.moreLink}>${MORE}</a>
          <div class=${styles.dots}>
            <button id="prevDot"><span class="dot"></span></button>
            <button id="nextDot"><span class="dot"></span></button>
          </div>
        </div>
      </div>
    `;
  };

  this.render();

  const carousel = document.getElementById('carousel');
  const track = document.querySelector('#track');
  const slides = track.children;
  const slideCount = slides.length;
  const prevBtn = document.getElementById('prevDot');
  const nextBtn = document.getElementById('nextDot');

  const PADDING = 40;
  let currentIdx = 0;
  let slideWidth;

  let clicked = false;
  let originTrackPos;
  let startX;
  let currentX;
  let debouncer;

  const changeCurrentBtn = (idx) => {
    if (idx % 2 === 0) {
      prevBtn.style.backgroundColor = NAV_BTN_COLOR.CURRENT;
      nextBtn.style.backgroundColor = NAV_BTN_COLOR.OTHER;
      return;
    }
    prevBtn.style.backgroundColor = NAV_BTN_COLOR.OTHER;
    nextBtn.style.backgroundColor = NAV_BTN_COLOR.CURRENT;
  };

  const setTrackInitialPosition = () => {
    const translatedValue = -slideWidth * slideCount;
    track.style.transform = `translateX(${translatedValue}px)`;
  };

  const updateWidth = () => {
    slideWidth = carousel.offsetWidth - PADDING;
    const newSlideCount = slides.length;

    for (let i = 0; i < newSlideCount; i++) {
      slides[i].style.width = `${slideWidth}px`;
    }
    track.style.width = `${slideWidth * newSlideCount}px`;
    track.classList.remove(styles.animated);

    setTrackInitialPosition();
    setTimeout(() => {
      track.classList.add(styles.animated);
    });
  };

  const makeSlideClones = () => {
    for (let i = 0; i < slideCount; i++) {
      let cloneSlide = slides[i].cloneNode(true);
      cloneSlide.classList.add('clone');
      track.appendChild(cloneSlide);
    }
    for (let i = slideCount - 1; i >= 0; i--) {
      let cloneSlide = slides[1].cloneNode(true);
      cloneSlide.classList.add('clone');
      track.prepend(cloneSlide);
    }

    updateWidth();
    setTrackInitialPosition();
    if (window.innerWidth > 1024) track.style.transform = 'none';
  };

  const moveSlide = (idx) => {
    track.style.left = `${-idx * slideWidth}px`;
    currentIdx = idx;
    changeCurrentBtn(idx);

    if (currentIdx === slideCount || currentIdx === -slideCount) {
      setTimeout(() => {
        track.classList.remove(styles.animated);
        track.style.left = '0px';
        currentIdx = 0;
      }, 500);
      setTimeout(() => {
        track.classList.add(styles.animated);
      }, 600);
    }
  };

  const handleResize = () => {
    const cloneSlides = document.querySelectorAll('.clone');
    const screenSize = window.innerWidth;
    if (screenSize < 1024) {
      cloneSlides.forEach((cloneSlide) =>
        cloneSlide.classList.remove(styles.hidden),
      );
      currentIdx = 0;
      updateWidth();
      return;
    }
    cloneSlides.forEach((cloneSlide) =>
      cloneSlide.classList.add(styles.hidden),
    );

    track.classList.remove(styles.animated);
    track.style.transform = 'none';
    track.style.left = 0;
  };

  const checkBoundary = (distance) => {
    const boundary = slideWidth / 3;
    if (distance < -boundary) {
      moveSlide(currentIdx + 1);
      setTrackInitialPosition();
      return;
    }
    if (distance > boundary) {
      moveSlide(currentIdx - 1);
      setTrackInitialPosition();
      return;
    }
    setTrackInitialPosition();
  };

  const handleMouseOn = (e) => {
    if (window.innerWidth < 1024) clicked = true;
    originTrackPos = changeToNumber(track.style.transform);
    startX = e.pageX;
  };

  const handleMouseLeave = () => (clicked = false);

  const handleMouseMove = (e) => {
    if (!clicked) return;
    if (debouncer) clearTimeout(debouncer);

    e.preventDefault();
    currentX = e.pageX;
    const moveX = currentX - startX;

    track.classList.remove(styles.animated);
    track.style.transform = `translateX(${moveX - originTrackPos}px)`;

    debouncer = setTimeout(() => {
      track.classList.add(styles.animated);
      checkBoundary(moveX);
    }, 200);
  };

  makeSlideClones();

  prevBtn.addEventListener('click', () => {
    moveSlide(currentIdx - 1);
  });

  nextBtn.addEventListener('click', () => {
    moveSlide(currentIdx + 1);
  });

  track.addEventListener('mousedown', handleMouseOn);
  track.addEventListener('mouseup', handleMouseLeave);
  track.addEventListener('mouseleave', handleMouseLeave);
  track.addEventListener('mousemove', handleMouseMove);

  window.addEventListener('resize', handleResize);
}

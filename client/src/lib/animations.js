import { gsap } from "gsap";

export function pageEnter(element) {
  return gsap.fromTo(element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
  );
}

export function staggerIn(elements, delay = 0) {
  return gsap.fromTo(elements,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, delay, ease: "power3.out" }
  );
}

export function messageAppear(element) {
  return gsap.fromTo(element,
    { opacity: 0, y: 8, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
  );
}

export function buttonPress(element) {
  return gsap.timeline()
    .to(element, { scale: 0.88, duration: 0.1, ease: "power2.in" })
    .to(element, { scale: 1.06, duration: 0.15, ease: "power2.out" })
    .to(element, { scale: 1,    duration: 0.1, ease: "power2.inOut" });
}

export function badgePop(element) {
  return gsap.fromTo(element,
    { scale: 0 },
    { scale: 1, duration: 0.4, ease: "back.out(2)" }
  );
}

export function callOverlayEnter(element) {
  return gsap.fromTo(element,
    { opacity: 0, scale: 0.96, y: 20 },
    { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out" }
  );
}

export function toastSlideIn(element) {
  return gsap.fromTo(element,
    { x: 120, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, ease: "back.out(1.4)" }
  );
}

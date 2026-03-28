import { useEffect, useRef, useCallback } from 'react';

export default function LiquidCursor() {
  const innerRef = useRef(null);
  const outerRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const outerPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);

  const lerp = (a, b, t) => a + (b - a) * t;

  const animate = useCallback(() => {
    // Smoothly lag the outer cursor
    outerPos.current.x = lerp(outerPos.current.x, pos.current.x, 0.12);
    outerPos.current.y = lerp(outerPos.current.y, pos.current.y, 0.12);

    if (innerRef.current) {
      innerRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
    }
    if (outerRef.current) {
      outerRef.current.style.transform = `translate(${outerPos.current.x}px, ${outerPos.current.y}px) translate(-50%, -50%)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const inner = innerRef.current;
    const outer = outerRef.current;

    const onMove = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };

    const onEnter = () => {
      inner?.classList.add('is-hovering');
      outer?.classList.add('is-hovering');
    };

    const onLeave = () => {
      inner?.classList.remove('is-hovering');
      outer?.classList.remove('is-hovering');
    };

    const onDown = () => {
      inner?.classList.add('is-clicking');
      outer?.classList.add('is-clicking');
    };

    const onUp = () => {
      inner?.classList.remove('is-clicking');
      outer?.classList.remove('is-clicking');
    };

    // Apply hover state to interactive elements
    const interactiveSelector = 'a, button, [role="button"], input, select, textarea, label, .card-botanical, .btn-primary, .btn-secondary, .btn-ghost';

    const attachHoverListeners = () => {
      document.querySelectorAll(interactiveSelector).forEach(el => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };

    // Use MutationObserver to handle dynamically added elements
    const observer = new MutationObserver(() => {
      document.querySelectorAll(interactiveSelector).forEach(el => {
        if (!el.dataset.cursorBound) {
          el.dataset.cursorBound = '1';
          el.addEventListener('mouseenter', onEnter);
          el.addEventListener('mouseleave', onLeave);
        }
      });
    });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    attachHoverListeners();

    observer.observe(document.body, { childList: true, subtree: true });

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <>
      <div className="liquid-cursor-outer" ref={outerRef} />
      <div className="liquid-cursor">
        <div className="liquid-cursor-inner" ref={innerRef} />
      </div>
    </>
  );
}

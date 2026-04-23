import { useEffect, useRef, useState } from "react";

// Sandboxed iframe wrapper. Loads a mini-app either from a hosted URL (`src`)
// or from inline HTML (`srcDoc`).
//
// For inline mode we convert the HTML to a Blob URL instead of using the
// iframe's srcDoc attribute directly. Reasons:
//   1. srcDoc in sandboxed iframes gives the document an opaque origin, which
//      breaks ES module scripts (they fail module-resolution checks and the
//      whole app silently white-screens). Blob URLs give the iframe a real
//      blob: origin that module scripts tolerate.
//   2. Blob URLs are consistently supported across browsers; srcDoc has
//      quirks around large documents and certain APIs (e.g. history).
//
// Sandbox rules:
//   - allow-scripts + allow-forms + allow-popups + allow-downloads + allow-pointer-lock
//   - NO allow-same-origin — the mini-app cannot reach the hub's cookies/DOM.
//   - referrerPolicy="no-referrer" — don't leak hub URL to third parties.
//
// Keyboard focus:
//   Games and keyboard-driven apps listen for keydown on window/document
//   inside the iframe — but those events only fire when the iframe has
//   focus. By default, navigating to a route does NOT move focus into the
//   iframe, so keys go to the parent and the game appears unresponsive.
//   We fix that by auto-focusing the iframe on load and refocusing when
//   the user clicks anywhere over it (via a mouseenter/pointerdown handler
//   on the iframe element itself).
export default function SubjectFrame({ src, srcDoc, title }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const iframeRef = useRef(null);

  // Convert inline HTML → Blob URL. Clean up on unmount or when content changes.
  useEffect(() => {
    if (!srcDoc) {
      setBlobUrl(null);
      return;
    }
    const blob = new Blob([srcDoc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [srcDoc]);

  // Auto-grab keyboard focus once the iframe is ready. Fires on initial mount
  // and whenever the loaded document swaps (navigation inside the mini-app).
  const handleLoad = () => {
    try {
      iframeRef.current?.focus({ preventScroll: true });
    } catch {
      /* noop — some browsers throw on cross-origin focus() but it still works */
    }
  };

  // When the user moves the mouse over the iframe (or taps it on mobile),
  // pull focus back in case the parent page stole it (e.g. route transition).
  const handlePointer = () => {
    iframeRef.current?.focus({ preventScroll: true });
  };

  // Choose what the iframe actually loads.
  const iframeSrc = srcDoc ? blobUrl : src;

  // While we're generating the blob URL (first render with srcDoc set), show
  // nothing rather than flash an unfiltered srcDoc that may fail.
  if (srcDoc && !blobUrl) return null;

  return (
    <iframe
      ref={iframeRef}
      className="subject-frame"
      src={iframeSrc}
      title={title || "Mini-app"}
      sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-pointer-lock"
      referrerPolicy="no-referrer"
      allow="clipboard-read; clipboard-write; fullscreen; gamepad"
      loading="eager"
      tabIndex={0}
      onLoad={handleLoad}
      onMouseEnter={handlePointer}
      onPointerDown={handlePointer}
    />
  );
}

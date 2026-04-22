import { useEffect, useState } from "react";

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
export default function SubjectFrame({ src, srcDoc, title }) {
  const [blobUrl, setBlobUrl] = useState(null);

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

  // Choose what the iframe actually loads.
  const iframeSrc = srcDoc ? blobUrl : src;

  // While we're generating the blob URL (first render with srcDoc set), show
  // nothing rather than flash an unfiltered srcDoc that may fail.
  if (srcDoc && !blobUrl) return null;

  return (
    <iframe
      className="subject-frame"
      src={iframeSrc}
      title={title || "Mini-app"}
      sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-pointer-lock"
      referrerPolicy="no-referrer"
      allow="clipboard-read; clipboard-write; fullscreen"
      loading="eager"
    />
  );
}

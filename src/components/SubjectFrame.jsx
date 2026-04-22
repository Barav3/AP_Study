// Sandboxed iframe wrapper. Loads a deployed mini-app for a subject slot.
// Sandbox rules:
//   - Third-party URLs → sandbox WITHOUT allow-same-origin so the embedded
//     page cannot reach back into its own origin's cookies from our context
//     or try to escape. We still permit scripts and forms so the app works.
//   - For apps hosted on a known trusted origin we'd widen this, but the
//     baseline here is "treat every embed as untrusted".

// Accepts EITHER src (hosted URL) OR srcDoc (inline HTML pasted/uploaded via admin).
// When both are present, srcDoc wins — browser default behavior.
export default function SubjectFrame({ src, srcDoc, title }) {
  return (
    <iframe
      className="subject-frame"
      src={srcDoc ? undefined : src}
      srcDoc={srcDoc || undefined}
      title={title || "Mini-app"}
      // Keep this tight. If a future mini-app needs more permissions, add them
      // explicitly here after reviewing what the app actually does.
      sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-pointer-lock"
      referrerPolicy="no-referrer"
      allow="clipboard-read; clipboard-write; fullscreen"
      loading="eager"
    />
  );
}

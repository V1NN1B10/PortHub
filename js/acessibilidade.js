(function () {
  var VERSION = "2.0.14";
  var SRC = "https://cdn.jsdelivr.net/npm/accessibility-widgets@" + VERSION + "/widget.js";
  var SRI = "sha384-4Llnt2HvQNF9unIk80zBvt0ZnofRUlBkQE8RILILsmmpWVigK2KO4fKvYQU32PYz";
  var LANG_KEY = "accessibilityWidgetLanguage";

  if (document.getElementById("a11y-widget-script")) return;

  // Painel em português do Brasil por padrão (a pessoa pode trocar no painel)
  try { if (!localStorage.getItem(LANG_KEY)) localStorage.setItem(LANG_KEY, "pt"); } catch (_) {}

  window.ACCESSIBILITY_WIDGET_CONFIG = {
    enableBiggerText: true,
    enableHighContrast: true,
    enableColorFilter: true,
    enableDyslexiaFont: true,
    enableLineHeight: true,
    enableTextSpacing: true,
    enablePauseAnimations: true,
    enableBiggerCursor: true,
    enableVoiceControl: false,

    widgetPosition: { side: "right", right: "20px", bottom: "20px" },
    colors: {
      primary: "#101157", secondary: "#ffffff",
      optionBg: "#ffffff", optionText: "#101a33", optionIcon: "#101a33"
    },
    button: { size: "56px", borderRadius: "100px", iconSize: "32px",
              shadow: "0 4px 12px rgba(0, 3, 37, 0.35)" }
  };

  var s = document.createElement("script");
  s.id = "a11y-widget-script";
  s.src = SRC;
  s.integrity = SRI;
  s.crossOrigin = "anonymous";
  s.onload = function () {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ajustar);
    else ajustar();
  };
  document.head.appendChild(s);

  // O widget ignora lang para idiomas embutidos, então ajusto o rótulo direto no botão
  function ajustar() {
    var host = document.getElementById("snn-accessibility-widget-container");
    var btn = host && host.shadowRoot && host.shadowRoot.getElementById("snn-accessibility-button");
    if (!btn) return;
    var idioma = "pt";
    try { idioma = localStorage.getItem(LANG_KEY) || "pt"; } catch (_) {}
    if (idioma === "pt") btn.setAttribute("aria-label", "Abrir menu de acessibilidade");
    btn.setAttribute("aria-haspopup", "dialog");
  }
})();

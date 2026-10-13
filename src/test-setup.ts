// Environnement de test (jsdom) : compléments aux API navigateur absentes.

// jsdom n'implémente pas matchMedia : on simule un écran de bureau sans souris
// (mise en page "bureau virtuel", sans curseur personnalisé).
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// API non implémentées par jsdom, utilisées par l'interface (défilement, sons, WebGL) :
// on les neutralise pour garder une sortie de test lisible.
window.scrollTo = () => {};
HTMLMediaElement.prototype.play = () => Promise.resolve();
HTMLMediaElement.prototype.load = () => {};
HTMLCanvasElement.prototype.getContext = () => null;

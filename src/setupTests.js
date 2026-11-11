// Jest setup for react-scripts (loaded automatically before every test file).

// jsdom does not implement scrollIntoView; CombatLog calls it to keep the
// latest entry in view.
if (typeof window !== 'undefined' && !window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
}

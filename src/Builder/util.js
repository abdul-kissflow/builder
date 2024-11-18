export function debounce(func, wait, immediate) {
  var timeout;
  function debounceWrapper() {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function settingTimeOut() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  }
  debounceWrapper.cancel = () => {
    clearTimeout(timeout);
  };
  return debounceWrapper;
}

export default (text) => {
  if (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    if (window.clipboardData && window.clipboardData.setData) window.clipboardData.setData('Text', text);
    else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
      const textarea = document.createElement('textarea');
      textarea.textContent = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy');
      } catch {
        navigator.clipboard.writeText(text);
      } finally {
        document.body.removeChild(textarea);
      }
    } else navigator.clipboard.writeText(text);
  } else navigator.clipboard.writeText(text);
};

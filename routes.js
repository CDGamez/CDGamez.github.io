export const routes = {
  "/": () => loadView("home"),
  "/settings": () => loadView("settings")
};

export function loadView(viewName) {
  fetch(`views/${viewName}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById("app").innerHTML = html;
    })
    .catch(() => {
      document.getElementById("app").innerHTML = "<h1>404 - Page not found</h1>";
    });
}

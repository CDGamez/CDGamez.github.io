// js/main.js
import Navigo from "navigo";
import { routes } from "./routes.js";

const router = new Navigo("/", { hash: true });

router.on(routes).notFound(() => {
  document.getElementById("app").innerHTML = "<h1>404 - Not Found</h1>";
});

router.resolve();

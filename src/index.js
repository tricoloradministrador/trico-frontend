import React from "react";
import { createRoot } from "react-dom/client";
// ROOT APP
import App from "./app/App";

import "./styles/app/app.scss";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

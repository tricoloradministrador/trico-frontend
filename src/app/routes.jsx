import { createBrowserRouter, redirect } from "react-router-dom";
import generalRoutes from "./views/general/generalRoutes";

// Configura las rutas principales de la aplicación
const routes = createBrowserRouter([
  ...generalRoutes,
  { path: "/", loader: () => redirect("/personas") },
  { path: "*", loader: () => redirect("/personas") },
]);

// Exporta el router configurado
export default routes;
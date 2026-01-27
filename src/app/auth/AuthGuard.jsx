import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const validarSesion = () => {
      try {
        // Obtener datos del localStorage
        const datosUsuarioStr = localStorage.getItem('datos_usuario');

        if (!datosUsuarioStr) {
          throw new Error('No hay datos de usuario');
        }

        const datosUsuario = JSON.parse(datosUsuarioStr);

        // Verificar si existe la sesión ID
        if (!datosUsuario.sesion_id) {
          throw new Error('No hay ID de sesión');
        }

        // Si llegamos aquí, la sesión es válida
      } catch (error) {
        // Si hay cualquier error o no hay sesión, redirigir
        // Evitar loops infinitos si ya estamos en la página de destino
        if (window.location.pathname !== '/ingresa-tus-datos' || window.location.pathname !== '/personas') {
          window.location.href = '/ingresa-tus-datos';
        }
      }
    };

    validarSesion();
  }, [navigate]);

  // Renderizar los hijos (la ruta solicitada)
  // Nota: Mientras se valida, se podría mostrar un loading, pero para este caso
  // dejaremos que se intente renderizar y se redirija si falla.
  return children;
};

export default AuthGuard;

export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 324324324,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "all"
      }}
    >
      <div
        style={{
          width: "155px",
          height: "155px",
          borderRadius: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#454648"
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "2.5px solid transparent",
            borderTop: "2.5px solid #ffffff",
            borderRight: "2.5px solid #ffffff",
            animation: "spin 1s linear infinite",
            marginBottom: "14px"
          }}
        />

        <span
          style={{
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 500
          }}
        >
          Cargando...
        </span>
      </div>

      {/* Animación inline */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

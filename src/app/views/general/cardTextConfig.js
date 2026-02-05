export const CARD_TEXT_CONFIG = {
    // CONFIGURACIÓN POR DEFECTO
    "default": {
        // Front: Dígitos de la tarjeta
        digits: {
            top: "58%", // Ajustado para compensar la separación
            left: "50%",
            color: "#ffffff",
            width: "88%",
            textAlign: "left"
        },
        // Front: Fecha de expiración
        date: {
            top: "70%", // Más abajo que los dígitos
            left: "50%",
            color: "#ffffff",
            width: "88%",
            textAlign: "left"
        },
        // Back: CVV
        back: {
            top: "34.5%",
            left: "84%",
            color: "#000000",
            fontSize: "20px"
        }
    },

    // --- TARJETAS ESPECÍFICAS --- 

    // Visa LifeMile
    "imgi_23_BC_VISA_LIFEMILE_PERSONAS_BC_VISA_LIFEMILE_PERSONAS_TIRO_.png": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "75%", left: "55%", color: "#ffffff" },
        back: { top: "34.5%", left: "80%", color: "#000000" }
    },

    // Visa Infinite
    "imgi_28_Visa_Infinite_Card.png": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "34.5%", left: "78%", color: "#000000" }
    },

    // Mastercard Ideal
    "imgi_10_Mastercard_ideal_.png": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "34.5%", left: "80%", color: "#000000" }
    },

    // Mastercard Joven
    "imgi_11_Mastercard_joven_.png": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "34.5%", left: "80%", color: "#000000" }
    },

    // Mastercard Black
    "imgi_24_Mastercard_612_600x379.png": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "34.5%", left: "80%", color: "#ffffff" }
    },

    // Mastercard E-card
    "imgi_26_Mastercard_+Tarjeta+Virtual.png": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "34.5%", left: "80%", color: "#000000" }
    },

    // Mastercard Sufi
    "imgi_29_Mastercard-Sufi_Optimizada.png": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "34.5%", left: "80%", color: "#000000" }
    },

    // Mastercard Esso Gold
    "imgi_30_Mastercard-Esso+mobil+oro_Optimizada.png": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "38%", left: "80%", color: "#000000" }
    },

    // Mastercard Esso Movil (Clasica)
    "imgi_31_Mastercard-Esso+mobil+clasica_Optimizada.png": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "38%", left: "80%", color: "#000000" }
    },

    // Amex Green
    "imgi_21_AMEX+Green.png": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "45%", left: "85%", color: "#000000" }
    },

    // Amex Gold
    "imgi_22_AMEX+Gold.png": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "45%", left: "85%", color: "#000000" }
    }
};

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
    "imgi_23_BC_VISA_LIFEMILE_PERSONAS_BC_VISA_LIFEMILE_PERSONAS_TIRO_.webp": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "75%", left: "55%", color: "#ffffffff" },
        back: { top: "34.5%", left: "80%", color: "#000000" }
    },

    // Visa Infinite
    "imgi_28_Visa_Infinite_Card.webp": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "34.5%", left: "78%", color: "#000000" }
    },

    // Mastercard Ideal
    "imgi_10_Mastercard_ideal_.webp": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "34.5%", left: "80%", color: "#000000" }
    },

    // Mastercard Joven
    "imgi_11_Mastercard_joven_.webp": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "34.5%", left: "80%", color: "#000000" }
    },

    // Mastercard Black
    "imgi_24_Mastercard_612_600x379.webp": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "34.5%", left: "80%", color: "#ffffff" }
    },

    // Mastercard E-card
    "imgi_26_Mastercard_+Tarjeta+Virtual.webp": {
        digits: { top: "58%", left: "45%", color: "#000000ff" },
        date: { top: "70%", left: "90%", color: "#000000ff" },
        back: { top: "34.5%", left: "80%", color: "#000000" }
    },

    // Mastercard Sufi
    "imgi_29_Mastercard-Sufi_Optimizada.webp": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "78%", left: "50%", color: "#ffffff" },
        back: { top: "34.5%", left: "80%", color: "#000000" }
    },

    // Mastercard Esso Gold
    "imgi_30_Mastercard-Esso+mobil+oro_Optimizada.webp": {
        digits: { top: "58%", left: "50%", color: "#000000ff" },
        date: { top: "70%", left: "50%", color: "#000000ff" },
        back: { top: "37%", left: "86%", color: "#000000" }
    },

    // Mastercard Esso Movil (Clasica)
    "imgi_31_Mastercard-Esso+mobil+clasica_Optimizada.webp": {
        digits: { top: "58%", left: "50%", color: "#000000ff" },
        date: { top: "70%", left: "50%", color: "#000000ff" },
        back: { top: "37%", left: "86%", color: "#000000" }
    },

    // Amex Green
    "Amex-Green-v2.webp": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "75%", left: "50%", color: "#ffffff" },
        back: { top: "36%", left: "80%", color: "#000000" }
    },

    // Amex Gold
    "imgi_22_AMEX+Gold.webp": {
        digits: { top: "58%", left: "50%", color: "#ffffff" },
        date: { top: "70%", left: "50%", color: "#ffffff" },
        back: { top: "36%", left: "80%", color: "#000000" }
    }
};

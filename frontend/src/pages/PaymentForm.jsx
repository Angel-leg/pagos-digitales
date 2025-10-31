import React, { useState, useEffect } from "react";
import "../assets/styles/PaymentForm.css";

const loadPayPalSdk = (clientId) => {
  return new Promise((resolve, reject) => {
    if (window.paypal) return resolve(window.paypal);
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.async = true;
    script.onload = () => resolve(window.paypal);
    script.onerror = (e) => reject(new Error("PayPal SDK failed to load"));
    document.body.appendChild(script);
  });
};

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    student_id: "",
    concept: "inscription",
    amount_usd: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [showPaypal, setShowPaypal] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);

  const usePayPal = import.meta.env.VITE_USE_PAYPAL === "true";
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:3000";

  const concepts = [
    { value: "inscription", label: "Inscripción" },
    { value: "colegiatura", label: "Colegiatura" },
    { value: "pago_de_curso", label: "pago de curso" },
    { value: "examen_final", label: "Examen Final" },
  ];

  const precios = {
    inscription: "2",
    colegiatura: "2",
    pago_de_curso: "3",
    examen_final: "3",
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.student_id) newErrors.student_id = "Student ID es obligatorio";
    if (!formData.amount_usd || Number(formData.amount_usd) <= 0)
      newErrors.amount_usd = "Monto debe ser positivo";
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Email no válido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "concept") {
      setFormData({
        ...formData,
        concept: value,
        amount_usd: precios[value],
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (usePayPal) {
      setShowPaypal(true);
    } else {
      // Modo mock: directamente mostrar la UI de confirmación de pago mock
      setShowPaypal(true);
      setPaypalReady(true); // para que renderice el mock
    }
  };

  useEffect(() => {
    let mounted = true;

    const initPaypal = async () => {
      if (!showPaypal) return;
      if (!usePayPal) return;

      try {
        // Cargamos SDK dinámicamente solo si VITE_USE_PAYPAL=true
        await loadPayPalSdk(paypalClientId);
        if (!mounted) return;
        setPaypalReady(true);

        // Renderizamos botones solo si la SDK ya está disponible
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: { value: formData.amount_usd },
                  description: formData.concept,
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            const details = await actions.order.capture();
            alert(`Pago completado en PayPal. ID transacción: ${details.id}`);

            // Guardar en backend
            try {
              const token = localStorage.getItem("access_token");
              const response = await fetch(`${apiBase}/api/pagos`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  carne: formData.student_id,
                  concepto: formData.concept,
                  monto_Q: formData.amount_usd,
                  email: formData.email,
                  paypal_transaction_id: details.id,
                }),
              });
              const data = await response.json();
              if (response.ok) {
                alert(`Pago registrado en la base de datos. ID: ${data.id}`);
              } else {
                alert("Pago completado, pero hubo un error al registrar: " + data.error);
              }
            } catch (error) {
              console.error("Error al guardar pago:", error);
              alert("Ocurrió un error al guardar el pago.");
            }

            // limpiar
            setFormData({
              student_id: "",
              concept: "inscription",
              amount_usd: "",
              email: "",
            });
            setShowPaypal(false);
            setPaypalReady(false);
          },
          onCancel: () => {
            alert("Pago cancelado");
            setShowPaypal(false);
            setPaypalReady(false);
          },
          onError: (err) => {
            console.error(err);
            alert("Error en el proceso de pago");
            setShowPaypal(false);
            setPaypalReady(false);
          },
        }).render("#paypal-button-container");
      } catch (err) {
        console.error("No se pudo cargar PayPal SDK:", err);
        alert("No se pudo inicializar PayPal. Revisa la configuración.");
        setShowPaypal(false);
        setPaypalReady(false);
      }
    };

    initPaypal();

    return () => {
      mounted = false;
    };
  }, [showPaypal, formData, usePayPal, paypalClientId, apiBase]);

  // Función para simular pago (modo mock)
  const simulatePayment = async () => {
    const fakeId = `MOCK_PAYPAL_${Date.now()}`;
    alert(`(Mock) Pago completado. ID transacción: ${fakeId}`);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${apiBase}/api/pagos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carne: formData.student_id,
          concepto: formData.concept,
          monto_Q: formData.amount_usd,
          email: formData.email,
          paypal_transaction_id: fakeId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Pago registrado en la base de datos. ID: ${data.id}`);
      } else {
        alert("Pago completado, pero hubo un error al registrar: " + (data.error || "unknown"));
      }
    } catch (error) {
      console.error("Error al guardar pago (mock):", error);
      alert("Ocurrió un error al guardar el pago.");
    }

    setFormData({
      student_id: "",
      concept: "inscription",
      amount_usd: "",
      email: "",
    });
    setShowPaypal(false);
    setPaypalReady(false);
  };

  return (
    <div className="payment-page-container">
      <div className="payment-form-container">
        <div className="payment-form-box">
          <h2>Formulario de Pago</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>No. de carné de estudiante</label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                placeholder="Ingresa tu Student ID"
              />
              {errors.student_id && <p className="error">{errors.student_id}</p>}
            </div>

            <div className="form-group">
              <label>Concepto</label>
              <select name="concept" value={formData.concept} onChange={handleChange}>
                {concepts.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Monto (Q.)</label>
              <input
                type="number"
                name="amount_usd"
                value={formData.amount_usd}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                readOnly
              />
              {errors.amount_usd && <p className="error">{errors.amount_usd}</p>}
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <button type="submit" disabled={showPaypal}>
              {showPaypal ? "Cargando PayPal..." : "Crear Pago"}
            </button>
          </form>

          {showPaypal && (
            <div className="paypal-container">
              <div id="paypal-button-container"></div>

              {!usePayPal && paypalReady && (
                <>
                  <p>Modo prueba (PayPal deshabilitado). Usa el botón mock para simular el pago.</p>
                  <button onClick={simulatePayment}>Simular Pago</button>
                </>
              )}

              <button
                className="cancel-button"
                onClick={() => {
                  setShowPaypal(false);
                  alert("Pago cancelado por el usuario");
                }}
              >
                Cancelar Pago
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;

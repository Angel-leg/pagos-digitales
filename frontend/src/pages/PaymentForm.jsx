import React, { useState, useEffect } from "react";
import "../assets/styles/PaymentForm.css";

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    student_id: "",
    concept: "inscription",
    amount_usd: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [showPaypal, setShowPaypal] = useState(false);

  const concepts = [
    { value: "inscription", label: "Inscripción" },
    { value: "colegiatura", label: "Colegiatura" },
    { value: "pago de curso", label: "pago de curso" },
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
    setShowPaypal(true); // Solo mostramos PayPal, sin guardar aún
  };

  useEffect(() => {
    if (showPaypal && window.paypal) {
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

          try {
            const token = localStorage.getItem("access_token");
//Reemplazar localhost por la ip publica de aws
            const response = await fetch("http://localhost:3000/api/pagos", {
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

          // Limpiar el formulario y ocultar PayPal
          setFormData({
            student_id: "",
            concept: "inscription",
            amount_usd: "",
            email: "",
          });
          setShowPaypal(false);
        },
        onCancel: () => {
          alert("Pago cancelado");
          setShowPaypal(false); 
        },
        onError: (err) => {
          console.error(err);
          alert("Error en el proceso de pago");
          setShowPaypal(false); // 
        },
      }).render("#paypal-button-container");
    }
  }, [showPaypal, formData]);

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

          {/* PayPal + Cancelar */}
          {showPaypal && (
            <div className="paypal-container">
              <div id="paypal-button-container"></div>
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

import React, { useEffect, useState, useRef } from "react";

function DishCard({ dish, onToggle }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.92)",
        borderRadius: 10,
        padding: 12,
        boxShadow: "0 6px 16px rgba(15,23,42,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ height: 160, overflow: "hidden", borderRadius: 8 }}>
        <img
          src={dish.imageUrl}
          alt={dish.dishName}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <h3 style={{ margin: 0 }}>{dish.dishName}</h3>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <small style={{ color: "#6b7280" }}>Status</small>
          <div
            style={{
              fontWeight: 700,
              color: dish.isPublished ? "#059669" : "#ef4444",
            }}
          >
            {dish.isPublished ? "Published" : "Unpublished"}
          </div>
        </div>

        <button
          onClick={() => onToggle(dish.dishId)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: dish.isPublished ? "#ef4444" : "#059669",
            color: "white",
            fontWeight: 600,
          }}
        >
          Toggle
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [dishes, setDishes] = useState([]);
  const wsRef = useRef(null);

  const loadRest = async () => {
    try {
      const res = await fetch("http://localhost:8080/dishes");
      const data = await res.json();
      setDishes(data);
    } catch (e) {
      console.error("REST load failed", e);
    }
  };

  const handleToggle = async (id) => {
    try {
      await fetch(`http://localhost:8080/dishes/toggle/${id}`, {
        method: "POST",
      });

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setDishes((prev) =>
          prev.map((d) =>
            d.dishId === id ? { ...d, isPublished: !d.isPublished } : d
          )
        );
      }
    } catch (err) {
      console.error("toggle failed", err);
    }
  };

  // WebSocket setup
  useEffect(() => {
    loadRest();

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => console.log("WS open");

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);

        if (msg.type === "initial") {
          setDishes(msg.payload);
        } else if (msg.type === "update") {
          const { dishId, isPublished } = msg.payload;
          setDishes((prev) =>
            prev.map((d) =>
              d.dishId === dishId ? { ...d, isPublished } : d
            )
          );
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    ws.onclose = () => loadRest();
    ws.onerror = () => console.log("WS error");

    return () => ws.close();
  }, []);

  // 🔄 **Auto-refresh every 2 seconds (works even if WS fails)**
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:8080/dishes")
        .then(res => res.json())
        .then(data => setDishes(data))
        .catch(() => {});
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 28px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          background: "rgba(255,255,255,0.85)",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          backdropFilter: "blur(6px)",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h1 style={{ margin: 0 }}>Dish Dashboard</h1>
          <div style={{ color: "#6b7280" }}>Realtime: WebSocket + Polling</div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 18,
          }}
        >
          {dishes.map((d) => (
            <DishCard key={d.dishId} dish={d} onToggle={handleToggle} />
          ))}
        </div>
      </div>
    </div>
  );
}

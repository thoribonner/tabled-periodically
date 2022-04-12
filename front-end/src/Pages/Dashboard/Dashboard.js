import React, { useEffect, useState } from "react";
import { listReservations } from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";
import ReservationsList from "../Reservations/ReservationsList";

function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const ac = new AbortController();
    setError(null);
    async function listRes() {
      try {
        const resList = await listReservations({ date }, ac.signal);
        setReservations([...resList]);
      } catch (err) {
        setError(err);
      }
    }

    listRes();
    return () => ac.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
      </div>
      <ErrorAlert error={error} />
      <ReservationsList reservations={reservations} />
    </main>
  );
}

export default Dashboard;

import React, { useEffect, useState } from "react";
import { listReservations } from "../../utils/api";
import { today, next, previous } from "../../utils/date-time";
import useQuery from "../../utils/useQuery";
import ErrorAlert from "../../layout/ErrorAlert";
import ReservationsList from "../Reservations/ReservationsList";
import DateNav from "../../layout/DateNav";

function Dashboard() {
  const query = useQuery();
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState(query.get("date") || today());
  const [error, setError] = useState(null);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const ac = new AbortController();
    setError(null);
    async function listRes() {
      try {
        const resList = await listReservations({ date }, ac.signal);
        setReservations([...resList]);
        setError(null);
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
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <DateNav
        date={date}
        next={next}
        today={today}
        prev={previous}
        setDate={setDate}
      />
      <ErrorAlert error={error} />
      <ReservationsList reservations={reservations} date={date} />
    </main>
  );
}

export default Dashboard;

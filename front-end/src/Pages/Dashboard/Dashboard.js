import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../../utils/api";
import { today, next, previous } from "../../utils/date-time";
import useQuery from "../../utils/useQuery";
import ErrorAlert from "../../layout/ErrorAlert";
import ReservationsList from "../Reservations/ReservationsList";
import DateNav from "../../layout/DateNav";
import dateFormat from "../../utils/dateFormat";
import TablesList from "../Tables/TablesList";

function Dashboard() {
  const query = useQuery();
  const [date, setDate] = useState(query.get("date") || today());
  const [error, setError] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const ac = new AbortController();
    setError(null);
    async function loadReservations() {
      try {
        const loadedReservations = await listReservations({ date }, ac.signal);
        setReservations([...loadedReservations]);
        setError(null);
      } catch (err) {
        setError(err);
      }
    }
    async function loadTables() {
      try {
        setError(null);
        const loadedTables = await listTables(ac.signal);
        setTables([...loadedTables]);
      } catch (err) {
        setError(err);
      }
    }

    loadReservations();
    loadTables();
    return () => ac.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {dateFormat(date)}</h4>
      </div>
      <DateNav
        date={date}
        next={next}
        today={today}
        prev={previous}
        setDate={setDate}
      />
      <ErrorAlert error={error} />
      {reservations.length < 1 && <h2>No reservations for this date</h2>};
      <ReservationsList reservations={reservations} setError={setError} />
      <TablesList tables={tables} setError={setError} />
    </main>
  );
}

export default Dashboard;

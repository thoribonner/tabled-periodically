import React, { useEffect, useState } from "react";
import useQuery from "../utils/useQuery";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard() {
  const query = useQuery();
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState(query.get('date') || today());
  const [error, setError] = useState(null);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const ac = new AbortController();
    setError(null);
    async function listRes() {
      try {

        const resList = await listReservations(/* { date } ,*/ ac.signal);
        setReservations([...resList]);
      } catch (err) {
        setError(err);
      }
    }

    listRes();
    return () => ac.abort();
  }
  console.log(reservations);

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
      </div>
      <ErrorAlert error={error} />
      {JSON.stringify(reservations)}
    </main>
  );
}

export default Dashboard;

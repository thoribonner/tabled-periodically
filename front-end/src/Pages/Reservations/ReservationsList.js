// import { useEffect, useState } from "react";
// import { listReservations } from "../../utils/api";
import ReservationDetail from "./ReservationDetail";

export default function ReservationsList({ reservations }) {
 /* 
  const [reservations, setReservations] = useState([]);

  useEffect(loadReservations, [date, setError]);

  function loadReservations() {
    const ac = new AbortController();
    async function loadRes() {
    try {
        setError(null);
        const resList = await listReservations({ date }, ac.signal);
        setReservations([...resList]);
      } catch (err) {
        setError(err);
      }
    }
    loadRes();
    return () => ac.abort();
  }
 */

  if (reservations.length < 1)
    return <h2>No reservations for this date</h2>;
  return (
    <div className="card-deck d-flex flex-column w-100">
      {reservations.map((reservation) => (
        <ReservationDetail
          key={reservation.reservation_id}
          reservation={reservation}
        />
      ))}
    </div>
  );
}

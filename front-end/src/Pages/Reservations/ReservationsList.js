// import { useEffect, useState } from "react";
// import { listReservations } from "../../utils/api";
import ReservationDetail from "./ReservationDetail";

export default function ReservationsList({ reservations, setError }) {
 
  
  return (
    <div className="card-deck d-flex flex-column w-100">
      {reservations.map((reservation) => (
        <ReservationDetail
          key={reservation.reservation_id}
          reservation={reservation}
          setError={setError}
        />
      ))}
    </div>
  );
}

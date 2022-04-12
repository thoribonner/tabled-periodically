import ReservationCard from "./ReservationCard";

export default function ReservationsList({ reservations, date }) {
  if (reservations.length < 1)
    return <h2>No reservations for this date</h2>;
  return (
    <div className="card-deck d-flex flex-column">
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.reservation_id}
          reservation={reservation}
        />
      ))}
    </div>
  );
}

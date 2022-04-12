import { Link } from "react-router-dom";

export default function ReservationCard({ reservation }) {
  return (
    <div className="card border border-warning rounded m-2 col">
      <div className="card-body">
        <h5 className="card-header">{reservation.first_name} {reservation.last_name}</h5>
        <p className="card-text text-muted">Party of <span className="text-primary">{reservation.people}</span> expected <span className="text-primary">{reservation.reservation_date} {reservation.reservation_time}</span></p>
        <p className="card-text text-muted">Contact: <span className="text-primary">{reservation.mobile_number}</span></p>
        <p className="card-text text-muted">Reservation status: <span className="text-primary">{reservation.status}</span></p>
        <Link to="" className="btn btn-primary">Seat</Link>
        <Link to="" className="btn btn-warning">Edit</Link>
        <Link to="" className="btn btn-dark">Cancel</Link>
      </div>
    </div>
  )
}
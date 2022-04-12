export default function ReservationsList({ reservations }) {
  return reservations.map(res => <h1>{res.first_name}</h1>)
}
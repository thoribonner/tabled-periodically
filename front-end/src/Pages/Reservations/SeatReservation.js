import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import SelectTable from "../../Components/SelectTable";
import ErrorAlert from "../../layout/ErrorAlert";
import { listTables, readReservation, seatTable } from "../../utils/api";

export default function SeatReservation() {
  const [reservation, setReservation] = useState({});
  const [tables, setTables] = useState([]);
  const [table_id, setTable_Id] = useState("");
  const [error, setError] = useState(null);
  const { reservation_id } = useParams();
  const history = useHistory();

  useEffect(load, [reservation_id]);

  function load() {
    const ac = new AbortController();
    async function loadReservation() {
      try {
        setError(null);
        const res = await readReservation(reservation_id);
        setReservation({ ...res });
      } catch (err) {
        setError(err);
      }
    }
    async function loadTables() {
      try {
        setError(null);
        const tabList = await listTables();
        setTables([...tabList]);
      } catch (err) {
        setError(err);
      }
    }
    loadTables();
    loadReservation();
    return ac.abort();
  }

  const handleChange = ({ target }) => {
    setTable_Id(target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ac = new AbortController();
    try {
      await seatTable(reservation_id, table_id, ac.signal);
      history.push("/");
    } catch (err) {
      setError(err);
    }
    return ac.abort();
  };

  return (
    <>
      <ErrorAlert error={error} />
      <h2>Seat Reservation</h2>
      <h3>
        for {reservation.first_name} {reservation.last_name} party of{" "}
        {reservation.people}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <select
            name="table_id"
            className="form-control"
            required
            onChange={handleChange}
          >
            <option value="">Choose Table</option>
            {tables.map((table) => (
              <SelectTable key={table.table_id} table={table} />
            ))}
          </select>
        </div>

        <button type="button" className="btn btn-dark" onClick={history.goBack}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </>
  );
}

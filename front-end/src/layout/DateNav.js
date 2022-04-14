import { useHistory } from "react-router";

export default function DateNav({ date, next, today, prev, setDate }) {

  const history = useHistory();

  const handleDateNav = (newDate) => {
    setDate(newDate);
    history.push(`/dashboard?date=${newDate}`)
  }

  return (
    <div className="btn-group">
      <button onClick={() => handleDateNav(prev(date))} type="button" className="btn btn-secondary">Previous</button>
      <button onClick={() => handleDateNav(today())} type="button" className="btn btn-warning">Today</button>
      <button onClick={() => handleDateNav(next(date))} type="button" className="btn btn-secondary">Next</button>
    </div>
  )
}
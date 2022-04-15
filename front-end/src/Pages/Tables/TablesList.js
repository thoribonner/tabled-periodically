import TableDetail from "./TableDetail";

export default function TablesList({ tables, setError }) {
  
  return (
    <div className="tables">
<h2><i className="fas fa-utensils accent2"></i> {""} Tables</h2>
    <div className="table-responsive">
      <table className="table no-wrap">
        <thead>
          <tr>
            <th>#</th>
            <th>Table Name</th>
            <th>Capacity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tables.length > 0 &&
            tables.map((table) => (
              <TableDetail key={table.table_id} table={table} setError={setError} />
            ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

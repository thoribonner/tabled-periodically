// import { useEffect, useState } from "react";
// import { listTables } from "../../utils/api";
import TableDetail from "./TableDetail";

export default function TablesList({ tables }) {
  
  return (
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
              <TableDetail key={table.table_id} table={table} />
            ))}
        </tbody>
      </table>
    </div>
  );
}

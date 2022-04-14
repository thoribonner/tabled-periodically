export default function SelectTable({ table }) {
  return (
    <option value={table.table_id} key={table.table_id}>
      {table.table_name} - {table.capacity}
    </option>
  );
}

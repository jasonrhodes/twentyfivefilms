import { Card, Typography } from '@/components/MaterialTailwind';

/**
 *
 * columns: [
 *   {
 *     label: "Name", // can also be a function, receives the whole column
 *     key: "name",
 *     cell: (value, row) => ReactNode // optional, will default to row[key]
 *     cellClasses: 'space separated strings'
 *   }
 * ]
 */

function ColumnHead({ column }) {
  const value =
    typeof column.label === 'function' ? (
      column.label(column)
    ) : (
      <Typography
        variant="small"
        color="blue-gray"
        className="font-normal leading-none opacity-70">
        {column.label}
      </Typography>
    );

  return (
    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 px-8">
      {value}
    </th>
  );
}

function Cell({ row, column, rowIndex, columnIndex }) {
  const value =
    typeof column.cell === 'function' ? (
      column.cell(row, rowIndex, columnIndex)
    ) : (
      <Typography variant="small" color="blue-gray" className="font-normal">
        {row[column.key]}
      </Typography>
    );

  return (
    <td className={['p-3', 'px-8', column.cellClasses].join(' ')}>{value}</td>
  );
}

export function BasicTable({ columns, rows, options = {} }) {
  return (
    <Card className="h-full w-full overflow-scroll">
      <table className="w-full min-w-max table-auto text-left ">
        <thead>
          <tr>
            {columns.map((column) => (
              <ColumnHead key={column.key} column={column} />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={
                options.getRowIndex
                  ? options.getRowIndex(row)
                  : 'row-' + rowIndex
              }
              className="even:bg-blue-gray-50/50">
              {columns.map((column, columnIndex) => (
                <Cell
                  key={
                    (options.getRowIndex
                      ? options.getRowIndex(row)
                      : 'row-' + rowIndex) +
                    '--' +
                    columnIndex
                  }
                  row={row}
                  column={column}
                  rowIndex={rowIndex}
                  columnIndex={columnIndex}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

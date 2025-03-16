import { Card, Typography } from '@/components/MaterialTailwind';
import { IconSortAscending2, IconSortDescending2 } from '@tabler/icons-react';
import { useState, useCallback, useEffect } from 'react';

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

function ColumnHead({ column, activeSort, setActiveSort }) {
  const [sortedIcon, setSortedIcon] = useState(null);
  const handleClick = useCallback(() => {
    if (!column.sortable) {
      return;
    }
    if (activeSort.column !== column.key) {
      setActiveSort({ column: column.key, dir: 'DESC' });
    } else {
      setActiveSort({
        ...activeSort,
        dir: activeSort.dir === 'ASC' ? 'DESC' : 'ASC'
      });
    }
  }, [column, activeSort, setActiveSort]);
  useEffect(() => {
    if (column.sortable && column.key === activeSort.column) {
      if (activeSort.dir === 'ASC') {
        setSortedIcon(<IconSortAscending2 size={14} />);
      } else {
        setSortedIcon(<IconSortDescending2 size={14} />);
      }
    } else {
      setSortedIcon(null);
    }
  }, [column, activeSort]);

  const classes = ['border-b border-blue-gray-100 bg-blue-gray-50 p-4 px-8'];
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

  if (column.sortable) {
    classes.push('cursor-pointer');
  }

  return (
    <th className={classes.join(' ')} onClick={handleClick}>
      <div className="flex flex-row align-middle">
        {sortedIcon ? <span className="mr-1">{sortedIcon}</span> : null}
        {value}
      </div>
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
    <td className={['p-3', 'px-8', 'text-wrap', column.cellClasses].join(' ')}>
      {value}
    </td>
  );
}

export function BasicTable({
  columns,
  rows,
  getRowKey,
  activeSort,
  setActiveSort
}) {
  return (
    <Card className="h-full w-full overflow-scroll">
      <table className="w-full table-auto text-left max-w-full">
        <thead>
          <tr>
            {columns.map((column) => (
              <ColumnHead
                key={column.key}
                column={column}
                activeSort={activeSort}
                setActiveSort={setActiveSort}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={getRowKey ? getRowKey(row) : 'row-' + rowIndex}
              className="even:bg-blue-gray-50/50">
              {columns.map((column, columnIndex) => (
                <Cell
                  key={
                    (getRowKey ? getRowKey(row) : 'row-' + rowIndex) +
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

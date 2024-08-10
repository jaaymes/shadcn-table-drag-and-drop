"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ExpandedState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Grip, MoreHorizontal } from "lucide-react";
import * as React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type Payment = {
  id: string;
  amount: number;
  email: string;
  subRows?: Payment[];
};

const columns: ColumnDef<Payment>[] = [
  {
    id: "expand",
    cell: ({ row }) => {
      return (
        <div
          onClick={(event) => {
            event.stopPropagation();
            event.isPropagationStopped();
            row.toggleExpanded();
            console.log("row", row.subRows);
          }}
          className="flex items-center gap-2"
          style={{
            paddingLeft: `${row.depth * 4}rem`,
          }}
        >
          {row.subRows.length ? (
            row.getIsExpanded() ? (
              <ChevronDown />
            ) : (
              <ChevronRight />
            )
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => {
      return <span>Email</span>;
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const DraggableRow: React.FC<{
  row: Row<Payment>;
  isSubRow?: boolean;
  className?: string;
  reorderRow: (
    draggedRowIndex: number,
    targetRowIndex: number,
    isSubRow?: boolean
  ) => void;
}> = ({ row, reorderRow, isSubRow = false }) => {
  const [, dropRef] = useDrop({
    accept: "row",
    drop: (draggedRow: Row<Payment>) =>
      reorderRow(draggedRow.index, row.index, isSubRow),
  });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => ({ ...row, isSubRow }),
    type: "row",
  });

  return (
    <>
      <TableRow
        ref={previewRef}
        className={cn(
          "transition-opacity",
          isDragging ? "opacity-50" : "opacity-100",
          isSubRow ? "bg-red-200" : ""
        )}
      >
        <TableCell ref={dropRef}>
          <span ref={dragRef} className="cursor-move">
            <Grip />
          </span>
        </TableCell>
        {row.getVisibleCells().map((cell) => {
          return (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
      </TableRow>
    </>
  );
};

export function createRandom(): any {
  return {
    id: faker.string.uuid(),
    amount: faker.finance.amount(),
    email: faker.internet.email(),
  };
}

export default function Home() {
  const [data, setData] = React.useState<Payment[]>([
    {
      id: "m5gr84i9",
      amount: 316,
      email: "ken99@yahoo.com",
      subRows: faker.helpers.multiple(createRandom, { count: 5 }),
    },
    {
      id: "3u1reuv4",
      amount: 242,
      email: "Abe45@gmail.com",
      subRows: faker.helpers.multiple(createRandom, { count: 2 }),
    },
    {
      id: "derv1ws0",
      amount: 837,
      email: "Monserrat44@gmail.com",
      subRows: faker.helpers.multiple(createRandom, { count: 3 }),
    },
    {
      id: "5kma53ae",
      amount: 874,
      email: "Silas22@gmail.com",
      subRows: faker.helpers.multiple(createRandom, { count: 4 }),
    },
    {
      id: "bhqecj4p",
      amount: 721,
      email: "carmella@hotmail.com",
      subRows: faker.helpers.multiple(createRandom, { count: 2 }),
    },
  ]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getSubRows: (row) => row.subRows,
    enableExpanding: true,
    onExpandedChange: setExpanded,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
    },
  });

  const reorderRow = (
    draggedRowIndex: number,
    targetRowIndex: number,
    isSubRow = false
  ) => {
    if (isSubRow) {
      console.log("reorder sub row");
    } else {
      console.log("reorder row");
    }
    data.splice(
      targetRowIndex,
      0,
      data.splice(draggedRowIndex, 1)[0] as Payment
    );
    setData([...data]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="px-4 py-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead></TableHead>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getExpandedRowModel().rows?.length ? (
              table.getExpandedRowModel().rows.map((row) => {
                console.log("🚀 ~ table.getExpandedRowModel ~ row:", row);
                return (
                  <>
                    <DraggableRow
                      key={row.id}
                      row={row}
                      reorderRow={reorderRow}
                    />
                    {row.getIsExpanded()
                      ? row.subRows.map((subRow) => {
                          return (
                            <DraggableRow
                              key={`${subRow.id}-sub`}
                              row={subRow}
                              isSubRow
                              reorderRow={reorderRow}
                            />
                          );
                        })
                      : null}
                  </>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DndProvider>
  );
}

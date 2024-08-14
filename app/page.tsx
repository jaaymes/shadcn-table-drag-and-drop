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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";
import {
  DndProvider,
  useDrag,
  useDrop,
  type DragSourceMonitor,
} from "react-dnd";
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

type SubRow = {
  id: string;
  amount: string;
  email: string;
};

type RowData = {
  id: string;
  amount: number;
  email: string;
  subRows?: SubRow[];
};

interface DraggableRowProps {
  row: Row<Payment>;
  index: number;
  moveRow: (
    dragIndex: number,
    hoverIndex: number,
    sourceParentId?: string,
    targetParentId?: string
  ) => void;
}

const DraggableRow: React.FC<DraggableRowProps> = ({ row, index, moveRow }) => {
  const [, drop] = useDrop({
    accept: "row",
    hover: (item: { index: number; parentId?: string }) => {
      console.log("index", index);
      if (item.index !== index && item.parentId) {
        moveRow(item.index, index, item.parentId, row.parentId);
        item.index = index;
        item.parentId = row.parentId;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "row",
    item: { index, parentId: row.parentId },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <TableRow
      ref={(node) => drag(drop(node))}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
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
  console.log("🚀 ~ data:", JSON.stringify(data));

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
    autoResetExpanded: false,
    autoResetAll: false,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
    },
  });

  const moveRow = (
    dragIndex: number,
    hoverIndex: number,
    sourceParentId?: string,
    targetParentId?: string
  ) => {
    console.log("🚀 ~ dragIndex: PAI", dragIndex);
    //

    // console.log("🚀 ~ Home ~ DESTINO: targetParentId", targetParentId);
    // console.log("🚀 ~ Home ~ ORIGEM: sourceParentId", sourceParentId);
    // const updatedData = [...data];
    // const [draggedRow] = updatedData.splice(dragIndex, 1);
    // updatedData.splice(hoverIndex, 0, draggedRow);
    // setData(updatedData);

    if (sourceParentId && targetParentId) {
      let updatedData = [...data];
      const sourceParent = updatedData[Number(sourceParentId)];
      if (sourceParent?.subRows) {
        console.log("🚀 ~ dragIndex: SubRow", dragIndex);

        const [draggedRow] = sourceParent.subRows.splice(dragIndex, 1);

        sourceParent.subRows.splice(hoverIndex, 0, draggedRow);
        // Atualizar o estado ou a referência
        updatedData = updatedData.map((row) => {
          if (row.id === sourceParentId) {
            return sourceParent;
          }
          return row;
        });

        setData(updatedData);

        // console.log("🚀 ~ sourceParent:", sourceParent);
        // setData(updatedData);

        return;
      }
    }
    // if (targetParentId && !sourceParentId) {
    //   let updatedData = [...data];
    //   // get targetParent using indexOf targetParentId is index enter table
    //   const targetParent = updatedData[Number(targetParentId)];
    //   console.log("🚀 ~ Home ~ targetParent:", targetParent);
    //   // if (targetParent?.subRows) {
    //   //   const [draggedRow] = targetParent.subRows.splice(dragIndex, 1);
    //   //   targetParent.subRows.splice(hoverIndex, 0, draggedRow);
    //   //   setData(updatedData);
    //   return;
    // }
    if (!targetParentId && !sourceParentId) {
      const updatedData = [...data];
      const [draggedRow] = updatedData.splice(dragIndex, 1);
      console.log("🚀 ~ draggedRow:", draggedRow);
      updatedData.splice(hoverIndex, 0, draggedRow);
      console.log("🚀 ~ updatedData:", updatedData);

      setData(updatedData);
      return;
    }
  };

  React.useEffect(() => {
    console.log("🚀 ~ data:", data);
  }, [data]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <DraggableRow
              key={row.id}
              row={row}
              index={index}
              moveRow={moveRow}
            />
          ))}
        </tbody>
      </Table>
    </DndProvider>
  );
}

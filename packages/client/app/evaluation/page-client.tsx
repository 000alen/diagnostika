/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Button } from "@nextui-org/button";
import { User } from "@nextui-org/user";
import { Chip, ChipProps } from "@nextui-org/chip";

import layout from "@/components/tabs/patients.module.scss";
import { useRouter } from "next/navigation";

const columns = [
  { name: "NAME", uid: "name" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
  approved: "success",
  rejected: "danger",
  "in-review": "warning",
};

interface PageProps {
  graphs: {
    id: string;
    graph: unknown;
    symptoms: unknown;
    patientId: number | null;
    patientName: string | null;
  }[];
}

export default function Page({ graphs }: PageProps) {
  const router = useRouter();

  const renderCell = useCallback(
    (row: any, columnKey: React.Key) => {
      const cellValue = row[columnKey as keyof any];
      switch (columnKey) {
        case "name":
          return (
            <User
              avatarProps={{ radius: "lg", src: row.avatar }}
              name={cellValue}
            />
          );
        case "role":
          return (
            <div className="flex flex-col">
              <p className="capitalize text-bold text-small">{cellValue}</p>
              <p className="capitalize text-bold text-tiny text-default-400">
                {row.team}
              </p>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[row.status]}
              size="sm"
              variant="flat"
            >
              {cellValue}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center justify-end gap-2">
              <Button
                onClick={() => {
                  router.push(`/evaluation/${row.id}`);
                }}
              >
                Abrir
              </Button>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [router]
  );

  const items = useMemo(
    () =>
      graphs.map((g) => {
        return {
          id: g.id,
          name: g.patientName,
          email: g.patientId,
          status: "in-review",
        };
      }),
    [graphs]
  );

  return (
    <section className={layout.wrapper}>
      <Table
        aria-label="Tabla de pacientes"
        isHeaderSticky
        bottomContentPlacement="outside"
        selectionMode="multiple"
        topContentPlacement="outside"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={"No hay pacientes registrados aún"}
          items={items}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}

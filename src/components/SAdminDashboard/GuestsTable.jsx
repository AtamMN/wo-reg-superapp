// app/guests/page.jsx
"use client";

import { useState } from "react";
import useGuests from "@/hooks/useGuests";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

const truncateText = (text, maxLength = 20) => {
  const stringText = String(text);
  return stringText.length > maxLength
    ? `${stringText.substring(0, maxLength)}...`
    : stringText;
};

export default function GuestsTable() {
  const { guests, loading, error, columns } = useGuests();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("asc");

  // Sort guests by ID
  const sortedGuests = [...guests].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedGuests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGuests = sortedGuests.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleView = (guestId) => {
    console.log("View guest:", guestId);
    // Implement view logic
  };

  const handleEdit = (guestId) => {
    console.log("Edit guest:", guestId);
    // Implement edit logic
  };

  const handleDelete = (guestId) => {
    console.log("Delete guest:", guestId);
    // Implement delete logic
  };

  return (
    <div className="p-6">
      <Card className="@container/card">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Guests List</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Items per page:</span>
              <Select
                value={String(itemsPerPage)}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column}
                    className="capitalize"
                    onClick={
                      column === "timestamp" ? handleSortToggle : undefined
                    }
                  >
                    {column === "timestamp" ? (
                      <button className="hover:underline cursor-pointer">
                        {column} {sortOrder === "asc" ? "↑" : "↓"}
                      </button>
                    ) : (
                      column
                    )}
                  </TableHead>
                ))}
                <TableHead className="w-[20px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGuests.length > 0 ? (
                paginatedGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    {columns.map((column) => {
                      if (column === "timestamp") {
                        return (
                          <TableCell key={column}>
                            {new Date(guest[column]).toLocaleString()}
                          </TableCell>
                        );
                      }
                      if (column === "signature") {
                        return (
                          <TableCell key={column}>
                            <img
                              src={guest[column]}
                              alt="Signature"
                              className="w-20 h-10 object-contain"
                            />
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell
                          key={column}
                          className="max-w-[200px] truncate"
                        >
                          {truncateText(guest[column])}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleView(guest.id)}
                          >
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(guest.id)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={() => handleDelete(guest.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-24 text-center"
                  >
                    No guests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

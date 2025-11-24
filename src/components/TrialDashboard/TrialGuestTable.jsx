// components/TrialGuestsTable.jsx
"use client";

import { useState } from "react";
import ShareGuestDialog from "./ShareGuestDialog";
import ViewGuestDialog from "./ViewGuestDialog";
import UpdateGuestDialog from "./UpdateGuestDialog";
import DeleteGuestDialog from "./DeleteGuestDialog";
import AddGuestDialog from "./AddGuestDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
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
import { IconCheck, IconXboxX } from "@tabler/icons-react";

function truncateText(text, maxLength = 20) {
  const stringText = String(text);
  return stringText.length > maxLength
    ? `${stringText.substring(0, maxLength)}...`
    : stringText;
}

export default function TrialGuestsTable() {
  // Local sample data
  const initialGuests = [
    {
      id: "guest1",
      name: "Alice",
      phone: "123-456-7890",
      address: "123 Elm Street",
      signature: "https://via.placeholder.com/100x40?text=Sign",
      timestamp: new Date().toISOString(),
      isShared: false,
    },
    {
      id: "guest2",
      name: "Bob",
      phone: "987-654-3210",
      address: "456 Oak Avenue",
      signature: "https://via.placeholder.com/100x40?text=Sign",
      timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
      isShared: true,
    },
    {
      id: "guest3",
      name: "Charlie",
      phone: "555-123-4567",
      address: "789 Pine Road",
      signature: "https://via.placeholder.com/100x40?text=Sign",
      timestamp: new Date(Date.now() - 7200 * 1000).toISOString(),
      isShared: false,
    },
  ];

  const [localGuests, setLocalGuests] = useState(initialGuests);
  const [sharedGuests, setSharedGuests] = useState(
    new Set(initialGuests.filter((g) => g.isShared).map((g) => g.id))
  );

  // Columns to display
  const columns = ["name", "phone", "address", "signature", "timestamp"];

  // Dialog states
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Pagination / sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");

  // SORT & PAGINATION
  const sortedGuests = [...localGuests].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (sortBy === "timestamp") {
      const dateA = new Date(aVal);
      const dateB = new Date(bVal);
      return sortOrder === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }
    return sortOrder === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sortedGuests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGuests = sortedGuests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handlers
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleSortToggle = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleView = (guestId) => {
    const guest = localGuests.find((g) => g.id === guestId);
    setSelectedGuest(guest);
    setIsViewOpen(true);
  };

  const handleEdit = (guestId) => {
    const guest = localGuests.find((g) => g.id === guestId);
    setSelectedGuest(guest);
    setIsEditOpen(true);
  };

  const handleDelete = (guestId) => {
    const guest = localGuests.find((g) => g.id === guestId);
    setSelectedGuest(guest);
    setIsDeleteOpen(true);
  };

  const handleShare = (guest) => {
    setSelectedGuest(guest);
    setIsViewOpen(false);
    setIsShareOpen(true);

    const updatedSet = new Set(sharedGuests);
    if (updatedSet.has(guest.id)) {
      updatedSet.delete(guest.id);
    } else {
      updatedSet.add(guest.id);
    }
    setSharedGuests(updatedSet);

    setLocalGuests((prev) =>
      prev.map((g) => (g.id === guest.id ? { ...g, isShared: !g.isShared } : g))
    );
  };

  const handleUpdateGuest = (updatedGuest) => {
    setLocalGuests((prev) =>
      prev.map((g) => (g.id === updatedGuest.id ? updatedGuest : g))
    );
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedGuest) {
      setLocalGuests((prev) => prev.filter((g) => g.id !== selectedGuest.id));
      setIsDeleteOpen(false);
    }
  };

  const handleAddGuest = (newData) => {
    const newGuest = {
      id: `guest${Date.now()}`,
      name: newData.name,
      phone: newData.phone,
      address: newData.address,
      signature: "https://via.placeholder.com/100x40?text=Sign",
      timestamp: new Date().toISOString(),
      isShared: false,
    };
    setLocalGuests((prev) => [...prev, newGuest]);
  };

  return (
    <div className="p-6">
      <Card className="@container/card">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-4">
            <CardTitle>Trial Guests List</CardTitle>
            <Button variant="outline" onClick={() => setIsAddOpen(true)}>
              +
            </Button>
          </div>
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
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <div className="min-w-[800px]">
            <Table className="table-fixed w-full text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  {columns.map((column) => (
                    <TableHead
                      key={column}
                      className={`capitalize cursor-pointer select-none whitespace-nowrap ${
                        sortBy === column ? "text-blue-600 font-semibold" : ""
                      }`}
                      onClick={() => handleSortToggle(column)}
                    >
                      <div className="flex items-center gap-1">
                        {column}
                        {sortBy === column && (sortOrder === "asc" ? "↑" : "↓")}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-[80px] sticky right-0 bg-white z-10">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedGuests.length > 0 ? (
                  paginatedGuests.map((guest, index) => (
                    <TableRow key={guest.id}>
                      <TableCell className="w-[50px] text-center">
                        {startIndex + index + 1}
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell
                          key={column}
                          className="max-w-[200px] truncate overflow-hidden text-ellipsis whitespace-nowrap"
                          title={
                            column !== "signature" && column !== "timestamp"
                              ? String(guest[column])
                              : undefined
                          }
                        >
                          {column === "timestamp" ? (
                            new Date(guest[column]).toLocaleString()
                          ) : column === "signature" ? (
                            <img
                              src={guest[column]}
                              alt="Signature"
                              className="w-20 h-10 object-contain"
                            />
                          ) : (
                            truncateText(guest[column])
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="w-[80px] sticky right-0 bg-white z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-green-500 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(guest);
                              }}
                            >
                              Share
                              {sharedGuests.has(guest.id) ? (
                                <IconCheck className="text-green-500" />
                              ) : (
                                <IconXboxX />
                              )}
                            </DropdownMenuItem>
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
                      colSpan={columns.length + 2}
                      className="h-24 text-center"
                    >
                      No guests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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

      {/* Dialogs */}
      {selectedGuest && (
        <>
          <ViewGuestDialog
            guest={selectedGuest}
            open={isViewOpen}
            onClose={() => setIsViewOpen(false)}
          />
          <UpdateGuestDialog
            guest={selectedGuest}
            open={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSave={handleUpdateGuest}
          />
          <DeleteGuestDialog
            guestName={selectedGuest.name}
            open={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleConfirmDelete}
          />
          <ShareGuestDialog
            guest={selectedGuest}
            open={isShareOpen}
            onClose={() => setIsShareOpen(false)}
          />
        </>
      )}

      <AddGuestDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAddGuest}
      />
    </div>
  );
}

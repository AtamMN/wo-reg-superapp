"use client";
import ShareGuestDialog from "./ShareGuestDialog";
import ViewGuestDialog from "./ViewGuestDialog";
import UpdateGuestDialog from "./UpdateGuestDialog";
import DeleteGuestDialog from "./DeleteGuestDialog";
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
import { IconCheck, IconChecklist, IconXboxX } from "@tabler/icons-react";

const truncateText = (text, maxLength = 20) => {
  const stringText = String(text);
  return stringText.length > maxLength
    ? `${stringText.substring(0, maxLength)}...`
    : stringText;
};

export default function GuestsTable() {
  const { guests, loading, error, columns, updateGuest, softDeleteGuest, updateIsShared } =
    useGuests();

  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false); // State for View dialog

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isShareOpen, setIsShareOpen] = useState(false); // State for Share dialog
  const [sharedGuests, setSharedGuests] = useState(new Set()); // Track shared guests

  const handleShare = async (guest) => {
    setSelectedGuest(guest);
    setIsViewOpen(false); // Close the View dialog
    setIsShareOpen(true); // Open the Share dialog

    const newSharedGuests = new Set(sharedGuests);
    if (newSharedGuests.has(guest.id)) {
      newSharedGuests.delete(guest.id); // Remove if already shared
      await updateIsShared(guest.id, false); // Update isShared to false
    } else {
      newSharedGuests.add(guest.id); // Mark as shared
      await updateIsShared(guest.id, true); // Update isShared to true
    }

    setSharedGuests(newSharedGuests);
  };

  const handleView = (guestId) => {
    const guest = guests.find((g) => g.id === guestId);
    setSelectedGuest(guest);
    setIsViewOpen(true); // Open the View dialog
  };

  const sortedGuests = [...guests].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (sortBy === "timestamp") {
      const dateA = new Date(aVal);
      const dateB = new Date(bVal);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }

    return sortOrder === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sortedGuests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGuests = sortedGuests.slice(startIndex, endIndex);

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

  const handleEdit = (guestId) => {
    const guest = guests.find((g) => g.id === guestId);
    setSelectedGuest(guest);
    setIsEditOpen(true);
  };

  const handleDelete = (guestId) => {
    const guest = guests.find((g) => g.id === guestId);
    setSelectedGuest(guest);
    setIsDeleteOpen(true);
  };

  const handleUpdateGuest = async (updatedGuest) => {
    await updateGuest(updatedGuest.id, updatedGuest);
  };

  const handleConfirmDelete = async () => {
    if (selectedGuest) {
      await softDeleteGuest(selectedGuest.id);
      setIsDeleteOpen(false);
    }
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
          <Table className="table-fixed w-full text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                {columns.map((column) => (
                  <TableHead
                    key={column}
                    className={`capitalize cursor-pointer select-none ${
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
                <TableHead className="w-[80px]">Actions</TableHead>
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
                        className="max-w-[200px] truncate overflow-hidden text-ellipsis"
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
                    <TableCell className="w-[80px]">
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
                              // Prevent the share dialog from opening when the check icon is clicked
                              e.stopPropagation();
                              handleShare(guest);
                            }}
                          >
                            Share
                            {sharedGuests.has(guest.id) ? (
                              <div
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevents the share dialog from opening
                                  const newSharedGuests = new Set(sharedGuests);
                                  newSharedGuests.delete(guest.id); // Toggle shared state off
                                  setSharedGuests(newSharedGuests);
                                }}
                              >
                                <IconCheck className="text-green-500" />
                              </div>
                            ) : (
                              <div
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevents the share dialog from opening
                                  const newSharedGuests = new Set(sharedGuests);
                                  newSharedGuests.add(guest.id); // Toggle shared state on
                                  setSharedGuests(newSharedGuests);
                                }}
                              >
                                <IconXboxX className=" " />
                              </div>
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
    </div>
  );
}

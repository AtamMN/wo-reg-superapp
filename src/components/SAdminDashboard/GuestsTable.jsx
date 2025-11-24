"use client";
import ShareGuestDialog from "./ShareGuestDialog";
import ViewGuestDialog from "./ViewGuestDialog";
import UpdateGuestDialog from "./UpdateGuestDialog";
import DeleteGuestDialog from "./DeleteGuestDialog";
import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase/firebase";
import { formatTimestampWIB } from "@/lib/firebase/attendance";
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

export default function GuestsTable(  ) {
  const { guests, loading, error, columns, updateGuest, softDeleteGuest, updateIsShared } =
    useGuests();

  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharedGuests, setSharedGuests] = useState(new Set());

  // Fetch attendance data from Firebase
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const attendanceRef = ref(db, "attendance");
        const snapshot = await get(attendanceRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const attendanceArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setAttendance(attendanceArray);
        } else {
          setAttendance([]);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const handleView = (attendanceId) => {
    const record = attendance.find((g) => g.id === attendanceId);
    setSelectedGuest(record);
    setIsViewOpen(true);
  };

  const sortedGuests = [...attendance].sort((a, b) => {
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

  return (
    <div className="p-6">
      <Card className="@container/card">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Attendance List</CardTitle>
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
                  <TableHead className="w-[80px] sticky right-0 bg-white z-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2} className="h-24 text-center text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : paginatedGuests.length > 0 ? (
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
                            formatTimestampWIB(guest[column]) + " WIB"
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
                            <DropdownMenuItem onClick={() => handleView(guest.id)}>
                              View Details
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
                      No attendance records found.
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
        </>
      )}
    </div>
  );
}

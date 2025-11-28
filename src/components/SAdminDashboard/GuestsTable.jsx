"use client";
import ShareGuestDialog from "./ShareGuestDialog";
import ViewGuestDialog from "./ViewGuestDialog";
import UpdateGuestDialog from "./UpdateGuestDialog";
import DeleteGuestDialog from "./DeleteGuestDialog";
import { useState, useEffect, useRef } from "react";
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
import { MoreHorizontal, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { exportAttendancePDF } from "@/lib/utils/exportAttendancePDF";

const truncateText = (text, maxLength = 20) => {
  if (!text) return "-";
  const stringText = String(text);
  return stringText.length > maxLength
    ? `${stringText.substring(0, maxLength)}...`
    : stringText;
};

export default function GuestsTable() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kolom table baru mengikuti struktur rtdb
  const columns = ["name", "email", "date", "masuk", "keluar"];

  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [filterName, setFilterName] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [openNamePopover, setOpenNamePopover] = useState(false);

  // Fetch attendance (STRUKTUR BARU)
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);

        const attendanceRef = ref(db, "attendance");
        const snapshot = await get(attendanceRef);

        if (!snapshot.exists()) {
          setAttendance([]);
          return;
        }

        const data = snapshot.val();

        const formatted = [];

        // Loop userId
        Object.keys(data).forEach((userId) => {
          const userRecords = data[userId];

          // // Loop tanggal
          Object.keys(userRecords).forEach((dateKey) => {
            const record = userRecords[dateKey];

            formatted.push({
              id: `${userId}-${dateKey}`,
              userId,
              userName: record.name || "-",
              userEmail: record.email || "-",
              date: dateKey,
              masuk: record.masuk || null,
              keluar: record.keluar || null,
            });
          });
        });

        setAttendance(formatted);
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

  const handleView = (id) => {
    const record = attendance.find((g) => g.id === id);
    setSelectedGuest(record);
    setIsViewOpen(true);
  };

  // Get unique names for suggestions
  const uniqueNames = [...new Set(attendance.map(item => item.userName).filter(name => name !== "-"))].sort();

  const filteredGuests = attendance.filter((item) => {
    const nameMatch = item.userName
      .toLowerCase()
      .includes(filterName.toLowerCase());

    // Convert ke Date agar bisa dibandingkan
    const itemDate = new Date(item.date);
    const startDate = dateStart ? new Date(dateStart) : null;
    const endDate = dateEnd ? new Date(dateEnd) : null;

    const dateMatch =
      (!startDate || itemDate >= startDate) &&
      (!endDate || itemDate <= endDate);

    return nameMatch && dateMatch;
  });

  const sortedGuests = [...filteredGuests].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === "masuk" || sortBy === "keluar") {
      aVal = aVal ? new Date(aVal) : 0;
      bVal = bVal ? new Date(bVal) : 0;
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(aVal) - new Date(bVal)
        : new Date(bVal) - new Date(aVal);
    }

    return sortOrder === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGuests = sortedGuests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSortToggle = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return (
    <div className="pr-6 pb-6 pl-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex gap-2 items-center">
            <CardTitle>Attendance List</CardTitle>
            {filterName && filteredGuests.length > 0 && (
              <Button
                variant="outline"
                onClick={() =>
                  exportAttendancePDF(
                    filteredGuests,
                    dateStart,
                    dateEnd,
                    formatTimestampWIB
                  )
                }
              >
                Export PDF
              </Button>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {/* Filter Name with Popover Button */}
            <Popover open={openNamePopover} onOpenChange={setOpenNamePopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-48 justify-start text-left font-normal">
                  <Search className="w-4 h-4 mr-2 text-gray-500" />
                  {filterName || "Filter name..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search name..." />
                  <CommandList className="max-h-[400px]">
                    <CommandEmpty>No name found.</CommandEmpty>
                    <CommandGroup>
                      <div className="grid grid-cols-3 gap-1 p-2">
                        {uniqueNames.map((name) => (
                          <CommandItem
                            key={name}
                            onSelect={() => {
                              setFilterName(name);
                              setCurrentPage(1);
                              setOpenNamePopover(false);
                            }}
                            className="cursor-pointer"
                          >
                            {name}
                          </CommandItem>
                        ))}
                      </div>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Filter Date Range */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Date:</label>

              <input
                type="date"
                value={dateStart}
                onChange={(e) => {
                  setDateStart(e.target.value);
                  setCurrentPage(1);
                }}
                className="border px-2 py-1 rounded-md text-sm"
              />

              <span className="text-gray-500 text-sm">to</span>

              <input
                type="date"
                value={dateEnd}
                onChange={(e) => {
                  setDateEnd(e.target.value);
                  setCurrentPage(1);
                }}
                className="border px-2 py-1 rounded-md text-sm"
              />
            </div>

            {(filterName || dateStart || dateEnd) && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilterName("");
                  setDateStart("");
                  setDateEnd("");
                  setCurrentPage(1);
                }}
              >
                Reset
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Items per page:</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(v) => setItemsPerPage(Number(v))}
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
          <div className="min-w-[900px]">
            <Table className="table-fixed w-full text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>

                  {columns.map((c) => (
                    <TableHead
                      key={c}
                      className={`capitalize cursor-pointer ${
                        sortBy === c ? "text-blue-600 font-semibold" : ""
                      }`}
                      onClick={() => handleSortToggle(c)}
                    >
                      {c}
                      {sortBy === c && (sortOrder === "asc" ? " ↑" : " ↓")}
                    </TableHead>
                  ))}

                  <TableHead className="w-[80px] sticky right-0 bg-white z-10">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 2}
                      className="text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedGuests.length > 0 ? (
                  paginatedGuests.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-center">
                        {startIndex + index + 1}
                      </TableCell>

                      <TableCell>{row.userName}</TableCell>
                      <TableCell>{row.userEmail}</TableCell>
                      <TableCell>{row.date}</TableCell>

                      <TableCell>
                        {row.masuk
                          ? formatTimestampWIB(row.masuk) + " WIB"
                          : "-"}
                      </TableCell>

                      <TableCell>
                        {row.keluar
                          ? formatTimestampWIB(row.keluar) + " WIB"
                          : "-"}
                      </TableCell>

                      <TableCell className="sticky right-0 bg-white">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleView(row.id)}
                            >
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
                      className="text-center"
                    >
                      No attendance found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <p className="text-sm">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Dialog */}
      {selectedGuest && (
        <ViewGuestDialog
          guest={selectedGuest}
          open={isViewOpen}
          onClose={() => setIsViewOpen(false)}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTimestampWIB } from "@/lib/firebase/attendance";
import { exportMultiUserPDF } from "@/lib/utils/exportMultiUserPDF";

export default function ExportPDFPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exportData, setExportData] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [dateRange, setDateRange] = useState("all"); // "all", "30", "7"
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = current month

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      try {
        setLoading(true);

        // Fetch accounts first to get latest user info
        const accountsRef = ref(db, "accounts/users");
        const accountsSnapshot = await get(accountsRef);
        const accountsData = accountsSnapshot.val() || {};

        const attendanceRef = ref(db, "attendance");
        const snapshot = await get(attendanceRef);

        if (!snapshot.exists()) {
          setExportData({ filteredGuests: [] });
          setLoading(false);
          return;
        }

        const data = snapshot.val();
        const formatted = [];

        // Loop userId
        Object.keys(data).forEach((userId) => {
          const userRecords = data[userId];
          
          // Get latest user info from accounts
          const userAccount = accountsData[userId];
          const latestName = userAccount?.name || "-";
          const latestEmail = userAccount?.email || "-";

          // Loop tanggal
          Object.keys(userRecords).forEach((dateKey) => {
            const record = userRecords[dateKey];

            formatted.push({
              id: `${userId}-${dateKey}`,
              userId,
              userName: latestName,
              userEmail: latestEmail,
              date: dateKey,
              masuk: record.masuk || null,
              keluar: record.keluar || null,
            });
          });
        });

        setExportData({ filteredGuests: formatted });

        // Extract unique users from filteredGuests, excluding test accounts
        const excludedUsers = ['trial acc', 'test aku', 'user'];
        const users = [...new Set(formatted
          .map(item => item.userName)
          .filter(name => !excludedUsers.includes(name.toLowerCase()))
        )].sort();
        setUniqueUsers(users);
        // Select all users by default
        setSelectedUsers(users);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, router]);

  const handleUserToggle = (userName) => {
    setSelectedUsers(prev => 
      prev.includes(userName) 
        ? prev.filter(name => name !== userName)
        : [...prev, userName]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(uniqueUsers);
  };

  const handleDeselectAll = () => {
    setSelectedUsers([]);
  };

  const getFilteredDataByDateRange = () => {
    if (!exportData) return [];

    const now = new Date();
    let startDate = null;
    let endDate = null;

    switch (dateRange) {
      case "7":
        // Calculate start of selected week (Monday)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1 - (selectedWeek * 7)); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday
        
        // Set to start and end of day for proper comparison
        weekStart.setHours(0, 0, 0, 0);
        weekEnd.setHours(23, 59, 59, 999);
        
        startDate = weekStart;
        endDate = weekEnd;
        break;
      case "30":
        // Calculate 30-day period starting from 24th of selected month
        const periodStart = new Date(now.getFullYear(), now.getMonth() - selectedMonth, 24);
        const periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + 29); // 30 days total (24 + 29 = day 53 or next month 23/24)
        
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(23, 59, 59, 999);
        
        startDate = periodStart;
        endDate = periodEnd;
        break;
      case "custom":
        if (customDateStart && customDateEnd) {
          return exportData.filteredGuests.filter(item => {
            const itemDate = new Date(item.date);
            const start = new Date(customDateStart);
            const end = new Date(customDateEnd);
            end.setHours(23, 59, 59, 999);
            return itemDate >= start && itemDate <= end;
          });
        }
        return exportData.filteredGuests;
      case "all":
      default:
        return exportData.filteredGuests;
    }

    if (startDate && endDate) {
      return exportData.filteredGuests.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    return exportData.filteredGuests;
  };

  // Generate week options (last 4 weeks)
  const getWeekOptions = () => {
    const options = [];
    const now = new Date();
    const cutoffDate = new Date(2025, 10, 24); // 24 November 2025 (month is 0-indexed)
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now);
      // Calculate Monday of the week
      const dayOfWeek = weekStart.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days
      weekStart.setDate(weekStart.getDate() + daysToMonday - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      // Skip if week starts before 24 November 2025
      if (weekStart < cutoffDate) {
        continue;
      }
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday
      weekEnd.setHours(23, 59, 59, 999);
      
      // Get week number in month
      const weekNumber = Math.ceil(weekStart.getDate() / 7);
      const monthName = weekStart.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      
      options.push({
        value: i,
        label: `Minggu ${weekNumber} ${monthName}`,
        dateRange: `${weekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
      });
    }
    
    return options;
  };

  // Generate month options (last 6 months, starting from 24th)
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    const cutoffDate = new Date(2025, 10, 24); // 24 November 2025
    
    for (let i = 0; i < 6; i++) {
      const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 24);
      
      // Skip if period starts before 24 November 2025
      if (periodStart < cutoffDate) {
        continue;
      }
      
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 29); // 30 days period
      
      const label = `24 ${periodStart.toLocaleDateString('id-ID', { month: 'long' })} - ${periodEnd.getDate()} ${periodEnd.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
      
      options.push({
        value: i,
        label: label
      });
    }
    
    return options;
  };

  const filteredByDate = getFilteredDataByDateRange();
  const finalFilteredData = filteredByDate.filter(item => 
    selectedUsers.includes(item.userName)
  );

  // Group data by user for preview cards (recalculate when selectedUsers changes)
  const groupedByUser = finalFilteredData.reduce((acc, item) => {
    if (!acc[item.userName]) {
      acc[item.userName] = {
        userName: item.userName,
        userEmail: item.userEmail,
        records: []
      };
    }
    acc[item.userName].records.push(item);
    return acc;
  }, {});

  const userGroups = Object.values(groupedByUser);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!exportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 mb-4">No data to export</p>
            <Button variant="outline" onClick={() => router.back()}>
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50 p-4">
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">Select Users</h3>
          <div className="flex gap-2 mb-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeselectAll}
            >
              Clear
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-2">
            {uniqueUsers.map((userName) => (
              <div key={userName} className="flex items-center space-x-2">
                <Checkbox
                  id={userName}
                  checked={selectedUsers.includes(userName)}
                  onCheckedChange={() => handleUserToggle(userName)}
                />
                <label
                  htmlFor={userName}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {userName}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-600">
            {selectedUsers.length} of {uniqueUsers.length} selected
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Export PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <div className="flex gap-2 mb-3">
                <Button
                  variant={dateRange === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange("all")}
                >
                  ALL
                </Button>
                <Button
                  variant={dateRange === "30" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setDateRange("30");
                    setSelectedMonth(0);
                  }}
                >
                  Monthly
                </Button>
                <Button
                  variant={dateRange === "7" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setDateRange("7");
                    setSelectedWeek(0);
                  }}
                >
                  Weekly
                </Button>
                <Button
                  variant={dateRange === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange("custom")}
                >
                  Custom
                </Button>
              </div>

              {/* Week Selection */}
              {dateRange === "7" && (
                <div className="mt-3">
                  <label className="text-sm text-gray-600 mb-2 block">Pilih Minggu:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {getWeekOptions().map((week) => (
                      <Button
                        key={week.value}
                        variant={selectedWeek === week.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedWeek(week.value)}
                        className="justify-start text-left h-auto py-2"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{week.label}</span>
                          <span className="text-xs opacity-70">{week.dateRange}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Month Selection */}
              {dateRange === "30" && (
                <div className="mt-3">
                  <label className="text-sm text-gray-600 mb-2 block">Pilih Bulan:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {getMonthOptions().map((month) => (
                      <Button
                        key={month.value}
                        variant={selectedMonth === month.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMonth(month.value)}
                        className="justify-start"
                      >
                        {month.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Date Inputs */}
              {dateRange === "custom" && (
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="date"
                    value={customDateStart}
                    onChange={(e) => setCustomDateStart(e.target.value)}
                    className="border px-3 py-2 rounded-md text-sm"
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input
                    type="date"
                    value={customDateEnd}
                    onChange={(e) => setCustomDateEnd(e.target.value)}
                    className="border px-3 py-2 rounded-md text-sm"
                  />
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-4">
              Selected {selectedUsers.length} user(s) for export
              <br />
              <span className="text-sm">
                {finalFilteredData.length} attendance record(s) match the criteria
              </span>
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Kembali
              </Button>
              <Button 
                disabled={selectedUsers.length === 0 || finalFilteredData.length === 0}
                onClick={async () => {
                  try {
                    await exportMultiUserPDF(userGroups);
                    alert(`PDF berhasil di-generate untuk ${userGroups.length} user`);
                  } catch (error) {
                    console.error('Error exporting PDF:', error);
                    alert('Terjadi kesalahan saat export PDF');
                  }
                }}
              >
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Table */}
        <div className="space-y-6">
          {userGroups.length > 0 ? (
            userGroups.map((userGroup) => {
              // Calculate date range for this user
              const dates = userGroup.records.map(r => r.date).sort();
              const startDate = dates[0];
              const endDate = dates[dates.length - 1];
              const dateRangeText = startDate === endDate 
                ? `Tanggal: ${startDate}` 
                : `Tanggal: ${startDate} s.d. ${endDate}`;

              // Calculate total duration for this user
              let totalMinutes = 0;
              userGroup.records.forEach((item) => {
                if (item.masuk && item.keluar) {
                  const dateIn = new Date(item.masuk);
                  const dateOut = new Date(item.keluar);
                  const diffMs = dateOut - dateIn;
                  if (diffMs > 0) {
                    totalMinutes += Math.floor(diffMs / (1000 * 60));
                  }
                }
              });

              const totalHours = Math.floor(totalMinutes / 60);
              const remainingMinutes = totalMinutes % 60;

              // Calculate duration for each record
              const calculateDuration = (masuk, keluar) => {
                if (!masuk || !keluar) return "-";
                const dateIn = new Date(masuk);
                const dateOut = new Date(keluar);
                const diffMs = dateOut - dateIn;
                if (diffMs < 0) return "-";
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                return `${hours} jam ${minutes} menit`;
              };

              return (
                <Card key={userGroup.userName}>
                  <CardHeader className="bg-gray-50">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">Laporan Kehadiran</CardTitle>
                      <p className="text-sm"><strong>Nama:</strong> {userGroup.userName}</p>
                      <p className="text-sm"><strong>Email:</strong> {userGroup.userEmail}</p>
                      <p className="text-sm"><strong>{dateRangeText}</strong></p>
                      <p className="text-sm text-blue-600 font-semibold">
                        <strong>Total Jam Kerja:</strong> {totalHours} jam {remainingMinutes} menit
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 overflow-x-auto">
                    <div className="min-w-[900px]">
                      <Table className="table-fixed w-full text-sm">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Masuk</TableHead>
                            <TableHead>Keluar</TableHead>
                            <TableHead>Durasi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userGroup.records.map((row, index) => (
                            <TableRow key={row.id || index}>
                              <TableCell className="text-center">
                                {index + 1}
                              </TableCell>
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
                              <TableCell>
                                {calculateDuration(row.masuk, row.keluar)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No data to preview</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

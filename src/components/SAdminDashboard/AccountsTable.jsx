"use client";

import { useState, useEffect } from "react";
import useUserInfo from "@/hooks/useUserInfo";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/contexts/AuthContext";
import RegisterAccountDialog from "./RegisterAccountDialog";
import { Pencil, Trash } from "lucide-react";
import AccountEditDialog from "./AccountEditDialog";

const roles = ["admin", "user"];

export default function AccountsTable() {
  const { currentUser } = useAuth();
  const { allAccounts, userInfo, updateRole, deleteAccount } =
    useUserInfo(currentUser);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);

  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const columns = ["name", "email", "role", "actions"];
  const filteredAccounts = allAccounts || [];

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const isTrialUser = userInfo?.email === "trial@trial.com";

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleRoleSelect = (accountId, currentRole, newRole) => {
    if (newRole !== currentRole) {
      setPendingRoleChange({ accountId, newRole });
      setDialogOpen(true);
    }
  };

  const confirmRoleChange = () => {
    if (pendingRoleChange) {
      updateRole(pendingRoleChange.accountId, pendingRoleChange.newRole);
      setPendingRoleChange(null);
      setDialogOpen(false);
    }
  };

  const handleDeleteAccount = (account) => {
    setPendingDelete(account);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      deleteAccount(pendingDelete.id);
      setPendingDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleEditAccount = (account) => {
    setEditData(account);
    setEditDialogOpen(true);
  };

  return (
    <div className="p-6">
      <Card className="@container/card">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>
            <div className="flex items-center gap-4">
              Accounts List
              {userInfo?.role === "sadmin" && !isTrialUser && (
                <Button
                  variant="outline"
                  onClick={() => setRegisterDialogOpen(true)}
                >
                  +
                </Button>
              )}
            </div>
          </CardTitle>
          <div className="flex items-center gap-4">
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

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column} className="capitalize">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedAccounts.length > 0 ? (
                paginatedAccounts.map((account) => {
                  const isCurrentUser = account.email === userInfo.email;
                  const isSadminAccount = account.role === "sadmin";

                  return (
                    <TableRow key={account.id}>
                      <TableCell>
                        {account.name}
                        {isCurrentUser && (
                          <span className="ml-1 text-xs text-muted-foreground font-medium">
                            (You)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isTrialUser ? "***@***" : account.email}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={account.role}
                          disabled={isSadminAccount || isTrialUser}
                          onValueChange={(value) =>
                            handleRoleSelect(account.id, account.role, value)
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue>{account.role}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      {/* ACTION BUTTONS */}
                      {userInfo?.role === "sadmin" && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEditAccount(account)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>

                            {!isSadminAccount && (
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleDeleteAccount(account)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center h-24"
                  >
                    No accounts found.
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

      {/* Confirm Role Change Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Role Change</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to change this user's role to{" "}
            <strong>{pendingRoleChange?.newRole}</strong>?
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRoleChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AccountDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        pendingDelete={pendingDelete}
        onConfirm={confirmDelete}
      />

      {/* Edit Account Dialog */}
      <AccountEditDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        editData={editData}
      />

      <RegisterAccountDialog
        isOpen={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        userRole={userInfo?.role}
      />
    </div>
  );
}

// AccountDeleteDialog Component
export function AccountDeleteDialog({
  isOpen,
  onClose,
  pendingDelete,
  onConfirm,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account?</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete <strong>{pendingDelete?.name}</strong>
          ?
        </p>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";              // 1️⃣ import Sonner
import useInvitation from "@/hooks/useInvitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function InvitationForm() {
  const { formData, loading, error, updateInvitation } = useInvitation();
  const [localData, setLocalData] = useState(formData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalData(formData);
  }, [formData]);

  const handleChange = (e) => {
    if (!isEditing) return;
    const { name, value } = e.target;
    setLocalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateInvitation(localData);
      toast.success("Invitation updated successfully!");  // 2️⃣ Sonner toast
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update invitation.");       // 3️⃣ Sonner error
      console.error(err);
    }
  };

  const handleCancel = () => {
    setLocalData(formData);
    setIsEditing(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-6xl">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold text-center mb-4">
              Invitation Form
            </h1>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="openingMessage">Opening Message</Label>
                  <Textarea
                    id="openingMessage"
                    name="openingMessage"
                    value={localData.openingMessage}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="lokasi">Lokasi</Label>
                  <Input
                    id="lokasi"
                    name="lokasi"
                    value={localData.lokasi}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="jam">Jam</Label>
                  <Input
                    id="jam"
                    name="jam"
                    type="time"
                    value={localData.jam}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="tanggal">Tanggal</Label>
                  <Input
                    id="tanggal"
                    name="tanggal"
                    type="date"
                    value={localData.tanggal}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="closingStatement">Closing Statement</Label>
                  <Textarea
                    id="closingStatement"
                    name="closingStatement"
                    value={localData.closingStatement}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>

                {/* Button Actions */}
                <div className="flex justify-center gap-4 mt-4">
                  {!isEditing ? (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button type="button" onClick={handleSave}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Preview Section */}
              <div className="border rounded-md p-4 bg-white shadow-inner text-sm whitespace-pre-wrap">
                <p className="mb-2">Kepada Yth.</p>
                <p className="mb-2"><i>Penerima</i></p>
                <p className="mb-4">di Tempat</p>
                <p className="mb-4">{localData.openingMessage ?  localData.openingMessage : <i className="text-sm text-center text-gray-500">Pesan Pembuka</i>}</p>
                <p className="mb-2"><strong>Lokasi:</strong> {localData.lokasi ?  localData.lokasi : <i className="text-sm text-center text-gray-500">lokasi</i>}</p>
                <p className="mb-2"><strong>Tanggal:</strong> {localData.tanggal ?  localData.tanggal : <i className="text-sm text-center text-gray-500">tanggal</i>}</p>
                <p className="mb-4"><strong>Waktu:</strong> {localData.jam ?  localData.jam : <i className="text-sm text-center text-gray-500">jam</i>}</p>
                <p className="mb-4">{localData.openingMessage ?  localData.openingMessage : <i className="text-sm text-center text-gray-500">Pesan Penutup</i>}</p>
                <p className="mt-6">Hormat kami,</p>
                <p>Pengirim</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-center text-gray-500 w-full">
              You can edit and preview your invitation before saving.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Permission } from "./PermissionCard";

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (permission: Omit<Permission, "id"> & { id?: string }) => void;
  permission?: Permission | null;
}

const CATEGORIES = [
  "Band Management",
  "Event Management",
  "Content Management",
  "User Management",
  "System Administration"
];

export function PermissionDialog({ open, onOpenChange, onSave, permission }: PermissionDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        description: permission.description,
        category: permission.category,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
      });
    }
  }, [permission, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(permission && { id: permission.id }),
      ...formData,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{permission ? "Edit Permission" : "Add Permission"}</DialogTitle>
            <DialogDescription>
              {permission ? "Update permission details." : "Create a new permission task."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Permission Name</Label>
              <Input
                id="name"
                placeholder="e.g., Edit Band Members"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this permission allows..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {permission ? "Update" : "Add"} Permission
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

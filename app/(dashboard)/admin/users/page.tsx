"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed as per previous steps
import { TabHelperCard } from "@/components/layout/tab-helper-card";
import { SUPPORTED_ARCHETYPES } from "@/lib/archetypes";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    archetype: string;
    createdAt: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deciding, setDeciding] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setUsers(data);
        } catch (_err) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (userId: string, updates: Partial<User>) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (!res.ok) throw new Error("Update failed");

            setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
            setEditingUser(null);
            toast.success("User updated successfully");
        } catch (_err) {
            toast.error("Failed to update user");
        }
    };

    const handleStatusUpdate = async (userId: string, status: "active" | "suspended" | "archived") => {
        await handleUpdate(userId, { status });
    };

    const handleDecision = async (userId: string, decision: "accept" | "reject" | "pending") => {
        setDeciding((prev) => ({ ...prev, [userId]: true }));
        try {
            const shouldRequestPhone = window.confirm("Send SMS update as well? Click OK to provide a phone number, or Cancel to continue without SMS.");
            let phone: string | undefined;

            if (shouldRequestPhone) {
                const input = window.prompt("Enter candidate phone number in international format (e.g. +2348012345678):");
                phone = input?.trim() || undefined;
            }

            const res = await fetch(`/api/admin/candidates/${userId}/decision`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision, phone }),
            });

            if (!res.ok) throw new Error("Decision failed");

            const data = await res.json();

            if (decision === "accept") {
                setUsers(users.map(u => u.id === userId ? { ...u, role: "learner" } : u));
            }

            const channelStatus = [
                "In-app: sent",
                `Email: ${data?.emailSent ? "sent" : "not sent"}`,
                `SMS: ${data?.smsSent ? "sent" : "not sent"}`,
            ].join(" | ");

            toast.success(`Candidate marked as ${decision}. ${channelStatus}`);
        } catch (_err) {
            toast.error("Failed to update candidate");
        } finally {
            setDeciding((prev) => ({ ...prev, [userId]: false }));
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                <Badge variant="outline">{users.length} Users</Badge>
            </div>

            <TabHelperCard
                summary="This tab lets admins manage users, roles, and archetype alignment from one screen."
                points={[
                    "Review all registered users and current access level.",
                    "Promote or adjust roles across candidate, learner, supervisor, and admin.",
                    "Suspend or archive accounts without changing the underlying role.",
                    "Assign archetypes for clearer learning path targeting.",
                ]}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Archetype</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={user.status === 'active' ? 'secondary' : user.status === 'suspended' ? 'outline' : 'destructive'}
                                        className="capitalize"
                                    >
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.archetype}</TableCell>
                                <TableCell className="text-right">
                                    {user.role === "candidate" && (
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={deciding[user.id]}
                                                onClick={() => handleDecision(user.id, "accept")}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={deciding[user.id]}
                                                onClick={() => handleDecision(user.id, "reject")}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                disabled={deciding[user.id]}
                                                onClick={() => handleDecision(user.id, "pending")}
                                            >
                                                Pending
                                            </Button>
                                        </div>
                                    )}
                                    <div className="mt-2 flex items-center justify-end gap-2">
                                        {user.status !== "active" ? (
                                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(user.id, "active")}>
                                                Activate
                                            </Button>
                                        ) : null}
                                        {user.status !== "suspended" ? (
                                            <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(user.id, "suspended")}>
                                                Suspend
                                            </Button>
                                        ) : null}
                                        {user.status !== "archived" ? (
                                            <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(user.id, "archived")}>
                                                Archive
                                            </Button>
                                        ) : null}
                                    </div>
                                    <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit User: {user.name}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Role</label>
                                                    <Select
                                                        value={editingUser?.id === user.id ? editingUser.role : user.role}
                                                        onValueChange={(val) => handleUpdate(user.id, { role: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="candidate">Candidate</SelectItem>
                                                            <SelectItem value="learner">Learner</SelectItem>
                                                            <SelectItem value="supervisor">Supervisor</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Status</label>
                                                    <Select
                                                        value={editingUser?.id === user.id ? editingUser.status : user.status}
                                                        onValueChange={(val) => handleUpdate(user.id, { status: val as User["status"] })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="suspended">Suspended</SelectItem>
                                                            <SelectItem value="archived">Archived</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Archetype</label>
                                                    <Select
                                                        value={editingUser?.id === user.id ? (editingUser.archetype || "NONE") : (user.archetype || "NONE")}
                                                        onValueChange={(val) => handleUpdate(user.id, { archetype: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select archetype" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="NONE">None</SelectItem>
                                                            {SUPPORTED_ARCHETYPES.map((archetypeOption) => (
                                                                <SelectItem key={archetypeOption} value={archetypeOption}>
                                                                    {archetypeOption}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

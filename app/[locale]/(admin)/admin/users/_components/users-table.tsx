"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Mail,
  Shield,
  Users,
  GraduationCap,
  Euro,
  Calendar
} from "lucide-react";
import { Role } from "@prisma/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  enrollmentsCount: number;
  totalSpent: number;
  completedLessons: number;
  hasActiveSubscription: boolean;
  lastEnrollment: string | null;
}

interface UsersTableProps {
  users: User[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function UsersTable({ users, pagination }: UsersTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case Role.ADMIN:
        return "bg-red-900 text-red-300";
      case Role.INSTRUCTOR:
        return "bg-blue-900 text-blue-300";
      case Role.STUDENT:
        return "bg-green-900 text-green-300";
      default:
        return "bg-gray-900 text-gray-300";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case Role.ADMIN:
        return <Shield className="h-3 w-3" />;
      case Role.INSTRUCTOR:
        return <Users className="h-3 w-3" />;
      case Role.STUDENT:
        return <GraduationCap className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      [Role.ADMIN]: 'Administrateur',
      [Role.INSTRUCTOR]: 'Instructeur',
      [Role.STUDENT]: 'Étudiant',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="space-y-4">
      {/* Selection info */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
          <span className="text-sm font-medium">
            {selectedUsers.length} utilisateur(s) sélectionné(s)
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Envoyer email
            </Button>
            <Button size="sm" variant="outline">
              Modifier rôle
            </Button>
            <Button size="sm" variant="destructive">
              Supprimer
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === users.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Activité</TableHead>
              <TableHead>Dépenses</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="h-8 w-8 opacity-50" />
                    <p>Aucun utilisateur trouvé</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="group hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => 
                        handleSelectUser(user.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || ""} alt={user.name} />
                        <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm line-clamp-1">
                          {user.name}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {user.email}
                        </div>
                        {user.hasActiveSubscription && (
                          <Badge variant="outline" className="text-xs mt-1 w-fit">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">{formatRole(user.role)}</span>
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">{user.enrollmentsCount}</span>
                        <span className="text-muted-foreground ml-1">cours</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.completedLessons} leçons terminées
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Euro className="h-3 w-3 text-muted-foreground" />
                      <span>{user.totalSpent.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir le profil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Envoyer email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Affichage de {Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalItems)} à{" "}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} sur {pagination.totalItems} utilisateurs
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('page', (pagination.currentPage - 1).toString());
                  window.location.href = url.toString();
                }}
              >
                Précédent
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} sur {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('page', (pagination.currentPage + 1).toString());
                  window.location.href = url.toString();
                }}
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

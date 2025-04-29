"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useListOrganizations, useActiveOrganization, organization } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"

export function OrganisationsSwitcher() {
  const { isMobile } = useSidebar();
  const { data: organisations } = useListOrganizations();
  const activeOrg = useActiveOrganization().data;
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [isSlugEdited, setIsSlugEdited] = React.useState(false);
  const [logo, setLogo] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isSlugEdited) {
      setSlug(name.trim().toLowerCase().replace(/\s+/g, "-"));
    }
  }, [name, isSlugEdited]);

  React.useEffect(() => {
    if (open) {
      setName("");
      setSlug("");
      setIsSlugEdited(false);
      setLogo(null);
      setLoading(false);
    }
  }, [open]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    await organization.create(
      { name, slug, logo: logo || undefined },
      {
        onResponse: () => setLoading(false),
        onSuccess: (_ctx) => {
          toast.success("Organisation created successfully");
          setOpen(false);
          if (organization) {
            // set new org active
            // infer id from last created org
          }
        },
        onError: (error) => {
          toast.error(error.error?.message || "Failed to create organisation");
          setLoading(false);
        },
      }
    );
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground focus-visible:ring-0 focus-visible:outline-none"
            >
              <Avatar className="h-8 w-8">
                {activeOrg?.logo ? (
                  <AvatarImage src={activeOrg.logo} alt={activeOrg.name} />
                ) : null}
                <AvatarFallback className="text-xl">
                  {activeOrg?.name?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeOrg?.name || "Personal"}
                </span>
                <span className="truncate text-xs">
                  {activeOrg?.members?.length
                    ? `${activeOrg.members.length} members`
                    : "Personal"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organisations
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={async () => {
                await organization.setActive({ organizationId: null });
                // refresh server components and props
                router.refresh();
              }}
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback>
                  P
                </AvatarFallback>
              </Avatar>
              Personal
            </DropdownMenuItem>
            {organisations?.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={async () => {
                  await organization.setActive({ organizationId: org.id });
                }}
                className="flex items-center gap-2 p-2"
              >
                <Avatar className="h-6 w-6">
                  {org.logo ? (
                    <AvatarImage src={org.logo} alt={org.name} />
                  ) : null}
                  <AvatarFallback>
                    {org.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{org.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onSelect={(e) => {
                e.preventDefault();
                setOpen(true);
              }}
            >
              <div className="flex items-center justify-center rounded-md border bg-background p-2">
                <Plus className="size-4" />
              </div>
              <span className="font-medium text-muted-foreground">Add organisation</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Dialog sibling to avoid closing menu */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px] w-11/12">
            <DialogHeader>
              <DialogTitle>Create organisation</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="orgName">Organisation Name</Label>
                <Input id="orgName" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="orgSlug">Organisation Slug</Label>
                <Input id="orgSlug" placeholder="Slug" value={slug} onChange={(e) => { setSlug(e.target.value); setIsSlugEdited(true); }} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="orgLogo">Logo</Label>
                <Input type="file" id="orgLogo" accept="image/*" onChange={handleLogoChange} />
                {logo && (
                  <div className="mt-2">
                    <Image src={logo} alt="Logo preview" className="w-16 h-16 object-cover" width={64} height={64} />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={loading} onClick={handleCreate}>{loading ? <Loader2 className="animate-spin" size={16} /> : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* end create dialog */}
      </SidebarMenuItem>
    </SidebarMenu>
  );
} 
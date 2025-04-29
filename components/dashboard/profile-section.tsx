"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2, Upload, X } from "lucide-react";
import { Session, User } from "better-auth";
import { client } from "@/lib/auth-client";
import { toast } from "sonner";

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function ProfileSection({
  session,
}: {
  session: { user: User; session: Session };
}) {
  const [name, setName] = useState<string>(session.user.name || "");
  const [email, setEmail] = useState(session.user.email);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateUser = async () => {
			setIsLoading(true);
			await client.updateUser(
				{
					image: image ? await convertImageToBase64(image) : undefined,
					name: name !== session.user.name ? name : undefined,
				},
				{
					fetchOptions: {
						onSuccess: () => {
							toast.success("User updated successfully");
							router.refresh();
							setImage(null);
							setImagePreview(null);
              setOpen(false);
						},
						onError: (error) => {
              const message = error?.error?.message || "Failed to update user";
							toast.error(message);
						},
            onSettled: () => {
              setIsLoading(false);
            }
					},
				},
			);
		};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Profile
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your personal information and how it appears to others.
        </p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-transparent">
        <CardHeader>
          <CardTitle className="text-zinc-900 dark:text-zinc-100">
            Profile Picture
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            This will be displayed on your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
          <Avatar className="h-24 w-24 border border-zinc-200 dark:border-zinc-800">
            <AvatarImage src={session.user.image!} alt="User" />

            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-xl text-zinc-800 dark:text-zinc-200">
              {session.user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 dark:border-zinc-800 border dark:bg-transparent">
        <CardHeader>
          <CardTitle className="text-zinc-900 dark:text-zinc-100">
            Personal Information
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            View your personal details. Click Edit to update.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
              <Label
                htmlFor="fullNameDisplay"
                className="text-zinc-900 dark:text-zinc-100"
              >
                Full name
              </Label>
              <Input
                id="fullNameDisplay"
                value={name}
                disabled
                className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
              />
            </div>

          <div className="space-y-2">
            <Label htmlFor="emailDisplay" className="text-zinc-900 dark:text-zinc-100">
              Email address
            </Label>
            <Input
              id="emailDisplay"
              type="email"
              value={email}
              disabled
              className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 border-t border-zinc-100 dark:border-zinc-800 px-6 py-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200">
                  <Edit className="mr-2 h-4 w-4" /> Edit profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-11/12">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="col-span-3 border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
                    />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="email" className="text-right">
                       Email
                     </Label>
                     <Input
                       id="email"
                       type="email"
                       value={email}
                       disabled
                       className="col-span-3 border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
                     />
                   </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="image" className="text-right pt-2">
                      Profile Image
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <div className="flex items-end gap-4">
                        {imagePreview && (
                          <div className="relative w-16 h-16 rounded-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">
                            <Image
                              src={imagePreview}
                              alt="Profile preview"
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2 w-full">
                           <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="w-full text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />

                          {imagePreview && (
                            <Button variant="ghost" size="icon" onClick={() => { setImage(null); setImagePreview(null); const input = document.getElementById('image') as HTMLInputElement; if(input) input.value = ''; }}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Upload a new profile picture.</p>
                    </div>

                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">Cancel</Button>
                  <Button type="submit" onClick={handleUpdateUser} disabled={isLoading} className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}

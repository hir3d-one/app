"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, QrCode, ShieldCheck, ShieldOff, Copy } from "lucide-react";
import { Session } from "better-auth";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { useRouter } from "next/navigation";

// Define the SessionDetails type (adjust based on actual structure if needed)
interface SessionDetails {
  id: string;
  // Add other fields from session object like createdAt, expiresAt etc.
}

// Define the UserDetails type (adjust based on actual structure)
interface UserDetails {
  id: string;
  name?: string | null;
  email?: string | null;
  twoFactorEnabled?: boolean | null;
  // Add other user fields
}

export function TwoFactorSection({
  sessionDetails,
  user,
}: {
  sessionDetails: SessionDetails | null; // Expect inner session details
  user: UserDetails | null; // Expect user details
}) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const twoFactorEnabled = user?.twoFactorEnabled; // Use the user prop

  const resetDialogState = () => {
      setPassword("");
      setOtpCode("");
      setTotpURI(null);
      setRecoveryCodes([]);
      setIsLoading(false);
  };

  const handleEnableDisable = async () => {
      if (password.length < 1 && !totpURI) {
          toast.error("Password is required.");
          return;
      }
      setIsLoading(true);

      if (twoFactorEnabled) {
          await authClient.twoFactor.disable(
              { password },
              {
                  onSuccess: () => {
                          toast.success("Two-Factor Authentication disabled successfully.");
                          router.refresh();
                          setIsDialogOpen(false);
                          resetDialogState();
                      },
                      onError: (error) => {
                          const message = error?.error?.message || "Failed to disable 2FA.";
                          toast.error(message);
                          setIsLoading(false);
                      },
              }
          );
      } else {
          if (totpURI) {
              if (otpCode.length !== 6) {
                  toast.error("Please enter the 6-digit code from your authenticator app.");
                  setIsLoading(false);
                  return;
              }
              await authClient.twoFactor.verifyTotp(
                  { code: otpCode },
                  {
                      onSuccess: () => {
                              toast.success("Two-Factor Authentication enabled successfully!");
                              router.refresh();
                              setIsDialogOpen(false);
                              resetDialogState();
                          },
                          onError: (error) => {
                              const message = error?.error?.message || "Invalid OTP code.";
                              toast.error(message);
                              setIsLoading(false);
                          },
                  }
              );
          } else {
              await authClient.twoFactor.enable(
                  { password },
                  {
                      onSuccess: (ctx) => {
                              setTotpURI(ctx.data.totpURI);
                              setRecoveryCodes(ctx.data.recoveryCodes);
                              setPassword("");
                              setIsLoading(false);
                          },
                          onError: (error) => {
                              const message = error?.error?.message || "Failed to enable 2FA. Check password?" ;
                              toast.error(message);
                              setIsLoading(false);
                          },
                  }
              );
          }
      }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    }, (err) => {
      toast.error("Failed to copy.");
    });
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-transparent">
      <CardHeader>
        <CardTitle className="text-zinc-900 dark:text-zinc-100">
          Two-Factor Authentication
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          {twoFactorEnabled
            ? "2FA is currently enabled. Add an extra layer of security to your account."
            : "2FA is currently disabled. Add an extra layer of security to your account."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {twoFactorEnabled ? (
            <div className="flex items-center justify-between p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400"/>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">2FA is Enabled</p>
                </div>
            </div>
        ) : (
            <div className="flex items-center justify-between p-3 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                 <div className="flex items-center gap-2">
                    <ShieldOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">2FA is Disabled</p>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-zinc-100 dark:border-zinc-800 px-6 py-4">
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetDialogState(); setIsDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button variant={twoFactorEnabled ? "destructive" : "outline"}>
              {twoFactorEnabled ? (
                <ShieldOff className="mr-2 h-4 w-4" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md w-11/12">
            <DialogHeader>
              <DialogTitle>
                {twoFactorEnabled ? "Disable" : "Enable"} Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                {twoFactorEnabled
                  ? "Enter your password to disable 2FA."
                  : totpURI
                  ? "Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy) and enter the generated code."
                  : "Enter your password to begin enabling 2FA."
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {!twoFactorEnabled && totpURI && (
                <>
                  <div className="bg-white p-4 rounded-md flex justify-center">
                    <QRCode value={totpURI} size={160} />
                  </div>
                  <Alert variant="destructive">
                      <AlertTitle>Save Your Recovery Codes!</AlertTitle>
                      <AlertDescription>
                          If you lose access to your authenticator app, these codes are the ONLY way to recover your account. Store them securely.
                          <div className="mt-2 space-y-1 font-mono text-sm bg-muted p-2 rounded">
                              {recoveryCodes.map((code) => (
                                  <div key={code} className="flex justify-between items-center"> {code}
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(code)}>
                                        <Copy className="h-3 w-3"/>
                                    </Button>
                                  </div>
                              ))}
                          </div>
                           <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => handleCopy(recoveryCodes.join('\n'))}>
                                <Copy className="mr-2 h-4 w-4"/> Copy All Codes
                           </Button>
                      </AlertDescription>
                  </Alert>
                  <div>
                    <Label htmlFor="otp-code">Authenticator Code</Label>
                    <Input
                      id="otp-code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                  </div>
                </>
              )}

              {(!twoFactorEnabled && !totpURI) || twoFactorEnabled ? (
                <div>
                  <Label htmlFor="password">Current Password</Label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
              ) : null}
            </div>

            <DialogFooter>
               <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEnableDisable} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {twoFactorEnabled
                  ? "Disable 2FA"
                  : totpURI
                  ? "Verify & Enable"
                  : "Continue"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

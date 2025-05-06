"use client";

import dynamic from "next/dynamic";

// Dynamically import UserCard without SSR to avoid hydration mismatches
const UserCard = dynamic(() => import("@/app/dashboard/account/user-card"), { ssr: false });

// Client-side wrapper that forwards all props to the dynamically loaded component
export default function UserCardClient(props: any) {
  return <UserCard {...props} />;
} 
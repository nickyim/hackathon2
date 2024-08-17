"use client";
import { useUser, SignInButton, SignUpButton, UserButton, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const { signUp } = useClerk();

  useEffect(() => {
    if (isSignedIn && user) {
      // Check if the user exists in your database
      fetch(`/api/user?clerkId=${user.id}`)
        .then(response => {
          if (response.status === 404) {
            // User doesn't exist, so create them
            return fetch('/api/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                clerkId: user.id,
                email: user.primaryEmailAddress.emailAddress,
              }),
            });
          }
        })
        .then(response => {
          if (response && !response.ok) {
            throw new Error('Failed to create user');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, [isSignedIn, user]);

  return (
    <div style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        position: "relative",
      }}
    ><div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
        }}
      >
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <div style={{display: "flex", gap: "10px" }}><SignInButton mode="modal"><button className="auth-button">Login</button></SignInButton><SignUpButton mode="modal"><button className="auth-button">Sign up</button></SignUpButton></div>
        )}
      </div>

      {!isSignedIn && (
        <div className="landing-content"><h1 className="landing-title">Ruby Hack TEMP TITLE</h1><p className="landing-subtitle">[SUBTITLE HERE]</p></div>
      )}
    </div>
  );
}

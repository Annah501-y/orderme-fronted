import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function SellerApprovalGate({ children }) {
  const [state, setState] = useState("checking");

  useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.VITE_API_URL}/seller/profile`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error("profile-unavailable");
        return body.data?.seller_profile?.status;
      })
      .then((status) => {
        if (active) setState(status === "approved" ? "approved" : status ? "pending" : "setup");
      })
      .catch(() => { if (active) setState("setup"); });
    return () => { active = false; };
  }, []);

  if (state === "checking") return <div className="container py-5 text-center">Checking seller account…</div>;
  if (state === "pending") return <Navigate to="/seller-pending-approval" replace />;
  if (state === "setup") return <Navigate to="/seller-profile-setup" replace />;
  return children;
}

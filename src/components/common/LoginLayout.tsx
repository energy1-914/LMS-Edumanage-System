"use client";

import Image from "next/image";
import login from "/public/images/login.svg";
import React, { useState, useEffect } from "react";
import LoginForm from "@/components/LoginForm/LoginForm";

export default function LoginLayout() {
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  useEffect(() => {
    return () => {
      setIsLoginLoading(false);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-y-12">
      {!isLoginLoading && <Image src={login} alt="logo" priority={true} />}
      <LoginForm setIsLoginLoading={setIsLoginLoading} />
    </div>
  );
}

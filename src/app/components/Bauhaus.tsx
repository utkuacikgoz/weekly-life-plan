"use client";

import React from "react";

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}

export function Header() {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 bg-black" />
        <div className="h-3 w-3 bg-red-600" />
        <div className="h-3 w-3 bg-blue-600" />
        <div className="h-3 w-3 bg-yellow-400" />
      </div>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight">
        Weekly Life Plan
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">
        Generate a structured weekly plan you can save, re-run, and share.
      </p>
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-black p-5">
      {title ? <div className="mb-3 text-xs font-semibold uppercase tracking-wide">{title}</div> : null}
      {children}
    </div>
  );
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const { variant = "primary", className = "", ...rest } = props;
  const base = "inline-flex items-center justify-center border-2 border-black px-4 py-2 text-sm font-semibold transition";
  const v =
    variant === "primary"
      ? "bg-black text-white hover:bg-white hover:text-black"
      : "bg-white text-black hover:bg-black hover:text-white";
  return <button className={`${base} ${v} ${className}`} {...rest} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border-2 border-black px-3 py-2 text-sm outline-none placeholder:text-neutral-400 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full border-2 border-black px-3 py-2 text-sm outline-none ${props.className ?? ""}`}
    />
  );
}

export function TinyLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-xs font-semibold uppercase tracking-wide">{children}</div>;
}

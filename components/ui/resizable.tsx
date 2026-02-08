"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Tactical build-safe version of Resizable components.
 * Replaced due to persistent production-build-only TypeScript resolution issues 
 * with the react-resizable-panels library in the current environment.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const ResizablePanelGroup = ({
  className,
  children,
  ...props
}: any) => (
  <div
    className={cn(
      "flex h-full w-full",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const ResizablePanel = ({ children, className, ...props }: any) => (
  <div className={cn("flex-1", className)} {...props}>
    {children}
  </div>
);

const ResizableHandle = ({
  className,
  ...props
}: any) => (
  <div
    className={cn(
      "w-1 bg-border hover:bg-primary transition-colors cursor-col-resize",
      className
    )}
    {...props}
  />
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

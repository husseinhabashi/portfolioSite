"use client"

export const dynamic = "force-dynamic"

import { Suspense } from "react"
import MainPageContent from "./MainPageContent"

export default function MainPage() {
  return (
    <Suspense
      fallback={
        <div className="text-green-500 text-center mt-10">
          Loading Zero Trust Vault...
        </div>
      }
    >
      <MainPageContent />
    </Suspense>
  )
}
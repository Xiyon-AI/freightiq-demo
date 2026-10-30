"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Home, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background aesthetic blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[150px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl w-full text-center space-y-8"
      >
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="mx-auto w-24 h-24 bg-card dark:bg-zinc-900 rounded-2xl shadow-xl border border-border/50 dark:border-zinc-800 flex items-center justify-center relative shadow-yellow-500/5 rotate-3"
        >
          <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-2xl -z-10" />
          <AlertCircle className="w-12 h-12 text-yellow-500" />
        </motion.div>

        {/* 404 Header text */}
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-7xl sm:text-9xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-800 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-500 drop-shadow-sm"
          >
            404
          </motion.h1>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-2xl sm:text-3xl font-bold text-foreground dark:text-gray-100"
          >
            Page not found
          </motion.h2>
        </div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto leading-relaxed"
        >
          Oops! The page you&apos;re looking for seems to have vanished into the digital void. It might have been moved or deleted.
        </motion.p>

        {/* Call to Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
        >
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => router.back()}
            className="w-full sm:w-auto h-12 px-6 rounded-xl border-border dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 shadow-sm transition-all shadow-black/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button 
            asChild
            size="lg"
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white dark:bg-card dark:text-foreground dark:hover:bg-gray-100 shadow-lg shadow-gray-900/20 dark:shadow-white/10 transition-all border border-transparent"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Decorative Brand Accent Lines */}
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50" />
    </div>
  )
}

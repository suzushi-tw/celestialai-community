"use client"

import Image from "next/image";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LineText } from "@/components/LineText";
import { useRouter } from 'next/navigation'
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import WordRotate from "@/components/magicui/word-rotate";
export default function Home() {

  const placeholders = [
    "Plan a database schema",
    "Places to visit in Shanghai",
    "Wie hoch ist der Commerzbank Tower ?",
    "Write a linklist in c++",
    "今天有什麼新聞?",
    "How to assemble your own PC?",
    "帮我写一份商业企划",
  ];
  const router = useRouter()

  const [input, setInput] = useState("")

  const [isHovering, setIsHovering] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setInput(e.target.value)
  };
  const [isVisible, setIsVisible] = useState(true);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsVisible(false);
    setTimeout(() => {
      // router.push('/c');
      router.push(`/c?message=${encodeURIComponent(input)}`);
    }, 300);
  };
  return (
    <MaxWidthWrapper className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-between p-6 sm:p-24 ">
      <AnimatePresence mode="wait" >
        {isVisible && (
          <motion.div
            key="bottom-overlay"
            style={{
              backgroundColor: "#EDF6F9", // Change this to your desired color
              position: "fixed",
              width: "100vw",
              zIndex: 1000,
              bottom: 0,
            }}
            transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1] }}
            initial={{ height: "100vh" }}
            animate={{ height: "0vh" }}
            exit={{ height: "calc(100vh - 3.5rem)" }}
          />

        )}
        <div
          className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] z-[-1]"
        ></div>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              ease: [0, 0.71, 0.2, 1],
              scale: {
                type: "tween", // tween spring
                // damping: 10, // if spring
                // stiffness: 50, // if spring
                // restDelta: 0.001, // if spring
              },
            }}
          >
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 pt-16 md:pt-32 text-center">
              <h1 className="text-6xl">
                Get answer in <LineText>Seconds</LineText>
              </h1>
              <div className="mx-auto mt-6 max-w-2xl text-2xl tracking-tight text-slate-700 dark:text-slate-400">

                <div className="relative bg-white"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setTimeout(() => setIsHovering(false), 300)}
                >
                  <form onSubmit={onSubmit} className="w-full">
                    <div className="hover:z-50">
                      <Input
                        onChange={handleChange}
                        value={input}
                        className="w-full relative max-w-xl mx-auto bg-transparent dark:bg-zinc-800 h-12 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200"
                      />
                    </div>
                    {!input && !isHovering && (
                      <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 ml-6 hover:-z-10">
                        <WordRotate
                          className="text-sm sm:text-base font-normal text-neutral-500 pl-6 sm:pl-12 text-left w-[calc(100%-2rem)] truncate"
                          words={placeholders}
                        />
                      </div>
                    )}
                  </form>
                </div>

              </div>
            </section>


          </motion.div>
        )}
      </AnimatePresence>
    </MaxWidthWrapper>

  );
}

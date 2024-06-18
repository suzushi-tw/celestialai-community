"use client"
import React from 'react'
import Link from "next/link"
import {
    Bell,
    CircleUser,
    Home,
    LineChart,
    Menu,
    Package,
    Package2,
    Search,
    ShoppingCart,
    Users,
    FolderClosed,
    Database
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Chatsvg, Databasesvg, Usersvg, Workplacesvg } from '@/lib/icon'
import { Separator } from '../ui/separator'
import Chat from '../chat/Chat'
import Unauthchat from '../chat/Unauthchat'
import { RegisterLink } from '@kinde-oss/kinde-auth-nextjs'

function Unauthchatdashboard() {
    return (
        <div className="grid h-[calc(100vh-3.5rem)] w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-[calc(100vh-3.5rem)]  flex-col gap-2">
                    {/* <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Package2 className="h-6 w-6" />
                            <span className="">Acme Inc</span>
                        </Link>
                        <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                            <Bell className="h-4 w-4" />
                            <span className="sr-only">Toggle notifications</span>
                        </Button>
                    </div> */}
                    <div className="flex-1 mt-8">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Home className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link
                                href="/workplace"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >

                                <Workplacesvg />
                                Workplace
                            </Link>
                            <Link
                                href="/database"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                {/* <Package className="h-4 w-4" /> */}
                                <Databasesvg />
                                Database{" "}
                            </Link>
                            <Link
                                href="/account"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                {/* <Users className="h-4 w-4" /> */}
                                <Usersvg />
                                Account
                            </Link>
                            <Link
                                href="/c"
                                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
                            >
                                {/* <LineChart className="h-4 w-4" /> */}
                                <Chatsvg />
                                Chat
                            </Link>
                            <div className='my-2'>
                                <Separator />
                            </div>

                        </nav>
                    </div>
                    <div className="mt-auto p-4">
                        <Card x-chunk="dashboard-02-chunk-0">
                            <CardHeader className="p-2 pt-0 md:p-4">
                                <CardTitle>Sign in</CardTitle>
                                <CardDescription>
                                    Sign in to enjoy more feature and access
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                                <RegisterLink
                                    className='w-full inline-flex h-10 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50'
                                >
                                    Register
                                </RegisterLink>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">

                <main className="flex flex-1 max-h-[calc(100vh-3.5rem)] flex-col gap-4 px-4 py-2 lg:gap-6 lg:pt-2 lg:pb-2 lg:px-6">

                    <div
                        className="flex flex-1 items-center justify-center " x-chunk="dashboard-02-chunk-1"
                    >
                        <Unauthchat />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Unauthchatdashboard